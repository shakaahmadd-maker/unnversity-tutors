import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import fs from "fs";
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Load Firebase config for project info
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  let firebaseConfig: any = {};
  if (fs.existsSync(configPath)) {
    try {
      firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (e) {
      console.error("Error reading firebase-applet-config.json:", e);
    }
  }

  // Initialize Firebase Admin SDK
  try {
    if (getApps().length === 0) {
      initializeApp({
        projectId: firebaseConfig.projectId || "gen-lang-client-0303245370"
      });
    }
    console.log("[BACKEND] Firebase Admin initialized successfully.");
  } catch (err) {
    console.error("[BACKEND] Firebase admin initialization error:", err);
  }

  // Secure API endpoint for creating privileged users (Tutors / Admins)
  app.post("/api/create-privileged-user", async (req, res) => {
    try {
      // Verify client identification token and enforce Superior Admin permission checks
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: Missing security identity token." });
      }
      const token = authHeader.split("Bearer ")[1];
      const authAdmin = getAuth();
      const decodedToken = await authAdmin.verifyIdToken(token);
      if (decodedToken.email?.toLowerCase().trim() !== "shaka.ahmadd@gmail.com") {
        return res.status(403).json({ error: "Forbidden: Only the Superior Admin (shaka.ahmadd@gmail.com) is authorized to generate profiles." });
      }

      const { name, email, role, extra } = req.body;

      if (!name || !email || !role) {
        return res.status(400).json({ error: "Missing required fields: name, email, role" });
      }

      if (role !== "tutor" && role !== "admin") {
        return res.status(400).json({ error: "Invalid role. Only 'tutor' and 'admin' can be created securely via the backend." });
      }

      console.log(`[BACKEND] Securing user creation request: ${name} (${email}) as role [${role}]`);

      const firestoreAdmin = getFirestore();

      // 1. Get or create the user in Firebase Authentication
      let userRecord;
      try {
        userRecord = await authAdmin.getUserByEmail(email);
        console.log(`[BACKEND] User already exists in Auth with UID: ${userRecord.uid}`);
      } catch (err: any) {
        if (err.code === "auth/user-not-found") {
          userRecord = await authAdmin.createUser({
            email,
            displayName: name,
            emailVerified: true
          });
          console.log(`[BACKEND] Created brand new Auth user with UID: ${userRecord.uid}`);
        } else {
          throw err;
        }
      }

      // 2. Impose secure Custom Claims depending on the chosen role
      const claims = role === "admin" ? { subadmin: true } : { tutor: true };
      await authAdmin.setCustomUserClaims(userRecord.uid, claims);
      console.log(`[BACKEND] Stamp Custom Claims: ${JSON.stringify(claims)}`);

      // 3. Write user details to Firestore with verification flags
      const userDocRef = firestoreAdmin.collection("users").doc(userRecord.uid);
      const newUser = {
        id: userRecord.uid,
        role,
        name,
        email: email.toLowerCase().trim(),
        avatarUrl: `https://images.unsplash.com/photo-${role === "tutor" ? "1534528741775-53994a69daeb" : "1494790108377-be9c29b29330"}?w=150&auto=format&fit=crop&q=80`,
        createdAt: new Date().toISOString(),
        verified: true,
        suspended: false,
        bio: extra?.bio || (role === "tutor" ? "Highly dedicated academic advisor with master credentials." : "Platform Administrator log"),
        hourlyRate: extra?.hourlyRate || (role === "tutor" ? 45 : 0),
        rating: role === "tutor" ? 5.0 : 0,
        reviewCount: role === "tutor" ? 0 : 0,
        subjects: extra?.subjects || (role === "tutor" ? ["English Literature"] : []),
        country: extra?.country || "US",
        availableSlots: role === "tutor" ? [
          new Date().toISOString().split("T")[0] + "T14:00:00.000Z",
          new Date(Date.now() + 86400000).toISOString().split("T")[0] + "T10:00:00.000Z"
        ] : []
      };

      await userDocRef.set(newUser);
      console.log(`[BACKEND] Firestore document registered for UID: ${userRecord.uid}`);

      // Sync privileged user details directly to Cloud SQL PostgreSQL database
      try {
        const { db: sqlDb } = await import("./src/db/index");
        const { users: sqlUsers } = await import("./src/db/schema");
        await sqlDb.insert(sqlUsers).values({
          id: newUser.id,
          role: newUser.role,
          name: newUser.name,
          email: newUser.email,
          avatarUrl: newUser.avatarUrl,
          createdAt: newUser.createdAt,
          suspended: newUser.suspended || false,
          verified: newUser.verified || false,
          bio: newUser.bio || null,
          hourlyRate: newUser.hourlyRate || null,
          rating: newUser.rating ? Number(newUser.rating) : null,
          reviewCount: newUser.reviewCount || null,
          country: newUser.country || null,
        }).onConflictDoUpdate({
          target: sqlUsers.id,
          set: {
            role: newUser.role,
            name: newUser.name,
            email: newUser.email,
            avatarUrl: newUser.avatarUrl,
            suspended: newUser.suspended || false,
            verified: newUser.verified || false,
            bio: newUser.bio || null,
            hourlyRate: newUser.hourlyRate || null,
            rating: newUser.rating ? Number(newUser.rating) : null,
            reviewCount: newUser.reviewCount || null,
            country: newUser.country || null,
          }
        });
        console.log(`[BACKEND] Synchronized privileged user ${newUser.id} to Cloud SQL successfully.`);
      } catch (sqlErr) {
        console.error("[BACKEND] Ignored Cloud SQL synchronization error during privileged user creation:", sqlErr);
      }

      return res.status(200).json({ success: true, user: newUser });
    } catch (error: any) {
      console.error("[BACKEND] Error in create-privileged-user endpoint:", error);
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // General user sync endpoint to save/update users from the frontend into Cloud SQL
  app.post("/api/sync-user", async (req, res) => {
    try {
      const { user } = req.body;
      if (!user || !user.id || !user.role || !user.name || !user.email) {
        return res.status(400).json({ error: "Missing required user fields for synchronization" });
      }

      console.log(`[BACKEND] Syncing user to SQL: ${user.name} (${user.id})`);

      const { db: sqlDb } = await import("./src/db/index");
      const { users: sqlUsers } = await import("./src/db/schema");

      await sqlDb.insert(sqlUsers).values({
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email.toLowerCase().trim(),
        avatarUrl: user.avatarUrl || "",
        createdAt: user.createdAt || new Date().toISOString(),
        suspended: user.suspended || false,
        verified: user.verified || false,
        bio: user.bio || null,
        hourlyRate: user.hourlyRate ? Math.round(Number(user.hourlyRate)) : null,
        rating: user.rating ? Number(user.rating) : null,
        reviewCount: user.reviewCount ? Number(user.reviewCount) : null,
        country: user.country || null,
      }).onConflictDoUpdate({
        target: sqlUsers.id,
        set: {
          role: user.role,
          name: user.name,
          email: user.email.toLowerCase().trim(),
          avatarUrl: user.avatarUrl || "",
          suspended: user.suspended || false,
          verified: user.verified || false,
          bio: user.bio || null,
          hourlyRate: user.hourlyRate ? Math.round(Number(user.hourlyRate)) : null,
          rating: user.rating ? Number(user.rating) : null,
          reviewCount: user.reviewCount ? Number(user.reviewCount) : null,
          country: user.country || null,
        }
      });

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("[BACKEND] Error syncing user to Cloud SQL:", error);
      return res.status(500).json({ error: error.message || "Failed to sync user to SQL" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULLSTACK] Server running on http://localhost:${PORT}`);
  });
}

startServer();
