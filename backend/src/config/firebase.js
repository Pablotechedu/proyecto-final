import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Verificar que exista el archivo de service account
let serviceAccount;
try {
  const serviceAccountPath = join(__dirname, '../../serviceAccountKey.json');
  const serviceAccountData = readFileSync(serviceAccountPath, 'utf8');
  serviceAccount = JSON.parse(serviceAccountData);
} catch (error) {
  console.error('❌ Error: No se encontró el archivo serviceAccountKey.json');
  console.error('📝 Por favor descarga el Service Account Key de Firebase Console');
  console.error('   y guárdalo como serviceAccountKey.json en la carpeta backend/');
  process.exit(1);
}

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID || 'hub-terapias'
});

const db = admin.firestore();
const auth = admin.auth();

// Configurar Firestore settings
db.settings({
  ignoreUndefinedProperties: true
});

console.log('✅ Firebase Admin SDK inicializado correctamente');
console.log(`📦 Proyecto: ${process.env.FIREBASE_PROJECT_ID || 'hub-terapias'}`);

export { admin, db, auth };
