import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

// Initialize with projectId and databaseId
initializeApp({
  projectId: config.projectId,
});

const db = getFirestore(config.firestoreDatabaseId);

async function run() {
  console.log("=== ADMIN DIAGNOSTIC START ===");
  const chatsSnap = await db.collection('chats').get();
  console.log(`Found ${chatsSnap.size} chats in database.`);
  
  for (const doc of chatsSnap.docs) {
    const data = doc.data();
    console.log(`\nChat ID: ${doc.id}`);
    console.log(`  Student ID: ${data.studentId}`);
    console.log(`  Tutor ID: ${data.tutorId}`);
    console.log(`  Subject: ${data.subject}`);
    
    const msgSnap = await db.collection('chats').doc(doc.id).collection('messages').get();
    console.log(`  Messages Count: ${msgSnap.size}`);
    msgSnap.docs.forEach(mDoc => {
      const mData = mDoc.data();
      console.log(`    Message [${mDoc.id}] by ${mData.senderId} at ${mData.timestamp}: "${mData.content}"`);
    });
  }
  console.log("\n=== ADMIN DIAGNOSTIC END ===");
  process.exit(0);
}

run().catch(err => {
  console.error("Admin query failed:", err);
  process.exit(1);
});
