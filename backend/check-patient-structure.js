import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkPatientStructure() {
  try {
    const snapshot = await db.collection('patients').limit(1).get();
    
    if (snapshot.empty) {
      console.log('No patients found');
      return;
    }

    snapshot.forEach(doc => {
      console.log('Patient ID:', doc.id);
      console.log('Patient Data:', JSON.stringify(doc.data(), null, 2));
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPatientStructure();
