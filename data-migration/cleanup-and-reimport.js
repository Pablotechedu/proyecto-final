// Script para limpiar Firestore y reimportar correctamente
import admin from "firebase-admin";
import fs from "fs";
import csv from "csv-parser";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const serviceAccount = require("./serviceAccountKey.json");

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Función para leer CSV
function readCSV(filename) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filename)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
}

// Paso 1: Limpiar colecciones incorrectas
async function cleanupCollections() {
  console.log("🧹 Limpiando colecciones incorrectas...\n");

  const collectionsToDelete = [
    "patientsBK",
    "parentTutors", // Colección principal (debería ser subcolección)
    "relatedProfessionals", // Colección principal (debería ser subcolección)
  ];

  for (const collectionName of collectionsToDelete) {
    try {
      const snapshot = await db.collection(collectionName).get();
      
      if (snapshot.empty) {
        console.log(`   ⚠️  ${collectionName}: Ya está vacía`);
        continue;
      }

      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`   ✅ ${collectionName}: ${snapshot.size} documentos eliminados`);
    } catch (error) {
      console.error(`   ❌ Error limpiando ${collectionName}:`, error.message);
    }
  }

  console.log("\n✨ Limpieza completada\n");
}

// Paso 2: Importar relatedProfessionals como subcolecciones
async function importRelatedProfessionals() {
  console.log("📥 Importando Related Professionals como subcolecciones...\n");

  try {
    const records = await readCSV("./relatedProfessionals.csv");
    console.log(`📊 Leídos ${records.length} registros\n`);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const record of records) {
      try {
        const { patientCode, name, specialty, contactInfo } = record;

        if (!patientCode || !name) {
          console.log(`⚠️  Saltando registro sin patientCode o nombre`);
          skippedCount++;
          continue;
        }

        // Buscar el paciente por patientCode
        const patientsSnapshot = await db
          .collection("patients")
          .where("patientCode", "==", patientCode)
          .limit(1)
          .get();

        if (patientsSnapshot.empty) {
          console.log(`❌ Paciente no encontrado: ${patientCode}`);
          errorCount++;
          continue;
        }

        const patientDoc = patientsSnapshot.docs[0];
        const patientId = patientDoc.id;

        // Separar contactInfo en email y phone si es posible
        const email = contactInfo && contactInfo.includes("@") ? contactInfo : "";
        const phone = contactInfo && !contactInfo.includes("@") ? contactInfo : "";

        // Preparar datos del profesional
        const professionalData = {
          name: name.trim(),
          profession: specialty.split(" ")[0] || "Médico", // Ej: "Neurólogo"
          specialty: specialty.trim(),
          institution: "",
          email: email.trim(),
          phone: phone.trim(),
          notes: "",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Agregar a la subcolección relatedProfessionals
        await db
          .collection("patients")
          .doc(patientId)
          .collection("relatedProfessionals")
          .add(professionalData);

        console.log(`✅ ${patientCode} → ${name}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error procesando ${record.patientCode}:`, error.message);
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 RESUMEN - Related Professionals:");
    console.log(`   ✅ Exitosos: ${successCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log(`   ⚠️  Saltados: ${skippedCount}`);
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("❌ Error importando relatedProfessionals:", error);
  }
}

// Función principal
async function main() {
  console.log("🚀 INICIANDO LIMPIEZA Y REORGANIZACIÓN DE FIRESTORE\n");
  console.log("=".repeat(60) + "\n");

  try {
    // Paso 1: Limpiar
    await cleanupCollections();

    // Paso 2: Reimportar relatedProfessionals
    await importRelatedProfessionals();

    console.log("=".repeat(60));
    console.log("\n✨ ¡Proceso completado exitosamente!\n");
    console.log("📝 Próximos pasos:");
    console.log("   1. Verifica en Firebase Console que las subcolecciones estén correctas");
    console.log("   2. Recarga la aplicación");
    console.log("   3. Verifica que los datos se muestren correctamente\n");
  } catch (error) {
    console.error("\n💥 Error fatal:", error);
    process.exit(1);
  }
}

// Ejecutar
main()
  .then(() => {
    console.log("👋 Script finalizado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Error:", error);
    process.exit(1);
  });
