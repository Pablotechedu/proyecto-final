import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicializar Firebase Admin
const serviceAccountPath = join(__dirname, '../serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function cleanDatabase() {
  console.log(
    "⚠️  ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos"
  );
  console.log("⚠️  Asegúrate de estar usando la base de datos de DESARROLLO");
  console.log("\n⏳ Esperando 5 segundos... Presiona Ctrl+C para cancelar\n");

  await new Promise((resolve) => setTimeout(resolve, 5000));

  const collections = [
    "users",
    "patients",
    "sessions",
    "sessionForms",
    "payments",
    "parentTutors",
    "professionals",
    "calendarEvents",
  ];

  let totalDeleted = 0;

  for (const collectionName of collections) {
    console.log(`\n🗑️  Limpiando colección: ${collectionName}`);

    try {
      const snapshot = await db.collection(collectionName).get();

      if (snapshot.empty) {
        console.log(`   ℹ️  Colección vacía, saltando...`);
        continue;
      }

      const batch = db.batch();
      let count = 0;

      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        count++;
      });

      await batch.commit();
      totalDeleted += count;
      console.log(`   ✅ ${count} documentos eliminados de ${collectionName}`);
    } catch (error) {
      console.error(`   ❌ Error limpiando ${collectionName}:`, error.message);
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ Base de datos limpiada completamente`);
  console.log(`📊 Total de documentos eliminados: ${totalDeleted}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

cleanDatabase()
  .then(() => {
    console.log("✅ Proceso completado. Puedes cerrar esta ventana.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ Error:", err);
    process.exit(1);
  });
