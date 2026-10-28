import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  console.log("=== DIAGNOSTIC START ===");
  const chatsSnap = await getDocs(collection(db, 'chats'));
  console.log(`Found ${chatsSnap.size} chats in database.`);
  
  for (const doc of chatsSnap.docs) {
    const data = doc.data();
    console.log(`\nChat ID: ${doc.id}`);
    console.log(`  Student ID: ${data.studentId}`);
    console.log(`  Tutor ID: ${data.tutorId}`);
    console.log(`  Subject: ${data.subject}`);
    console.log(`  Updated At: ${data.updatedAt}`);
    
    const msgSnap = await getDocs(collection(db, 'chats', doc.id, 'messages'));
    console.log(`  Messages Count: ${msgSnap.size}`);
    msgSnap.docs.forEach(mDoc => {
      const mData = mDoc.data();
      console.log(`    Message [${mDoc.id}] by ${mData.senderId} at ${mData.timestamp}: "${mData.content}"`);
    });
  }
  console.log("\n=== DIAGNOSTIC END ===");
}

run().catch(console.error);
