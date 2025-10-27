const admin = require('firebase-admin');

// Verificar que exista el archivo de service account
let serviceAccount;
try {
  serviceAccount = require('../../serviceAccountKey.json');
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

module.exports = { admin, db, auth };
