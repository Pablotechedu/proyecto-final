// Script para importar parentTutors como subcolecciones de pacientes
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

async function importParentTutors() {
  console.log("🚀 Importando Parent Tutors como subcolecciones...\n");

  const results = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream("./parentTutors.csv")
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        console.log(`📊 Leídos ${results.length} registros de parentTutors\n`);

        let successCount = 0;
        let errorCount = 0;
        let skippedCount = 0;

        for (const record of results) {
          try {
            const { patientCode, name, email, phone1, phone2 } = record;

            // Saltar si no hay patientCode o nombre
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

            // Preparar datos del padre/tutor
            const parentData = {
              name: name.trim(),
              email: email ? email.trim() : "",
              phone: phone1 ? phone1.trim() : (phone2 ? phone2.trim() : ""),
              relationship: "Padre/Madre", // Valor por defecto
              isPrimary: true, // Marcar como principal por defecto
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            // Agregar a la subcolección parentTutors
            await db
              .collection("patients")
              .doc(patientId)
              .collection("parentTutors")
              .add(parentData);

            console.log(`✅ ${patientCode} → ${name}`);
            successCount++;
          } catch (error) {
            console.error(`❌ Error procesando ${record.patientCode}:`, error.message);
            errorCount++;
          }
        }

        console.log("\n" + "=".repeat(60));
        console.log("📊 RESUMEN:");
        console.log(`   ✅ Exitosos: ${successCount}`);
        console.log(`   ❌ Errores: ${errorCount}`);
        console.log(`   ⚠️  Saltados: ${skippedCount}`);
        console.log(`   📁 Total: ${results.length}`);
        console.log("=".repeat(60));

        resolve();
      })
      .on("error", (error) => {
        console.error("❌ Error leyendo CSV:", error);
        reject(error);
      });
  });
}

// Ejecutar
importParentTutors()
  .then(() => {
    console.log("\n✨ Importación completada!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Error fatal:", error);
    process.exit(1);
  });
