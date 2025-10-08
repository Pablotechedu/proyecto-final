// scripts/import.js
import admin from "firebase-admin";
import fs from "fs";
import csv from "csv-parser";
import path from "path";
import { createRequire } from "module";

// Importar JSON de forma compatible
const require = createRequire(import.meta.url);
const serviceAccount = require("./serviceAccountKey.json");

// --- CONFIGURACIÓN ---
const CSV_FOLDER = "./"; // Carpeta donde están los CSV

// 1. Define qué archivos CSV corresponden a sub-colecciones
const SUBCOLLECTION_MAP = {
  parentTutors: {
    parentCollection: "patients",
    linkingField: "patientCode",
  },
  relatedProfessionals: {
    parentCollection: "patients",
    linkingField: "patientCode",
  },
  platformAccess: {
    parentCollection: "patients",
    linkingField: "patientCode",
  },
  // Agrega aquí otras futuras sub-colecciones si las necesitas
};
// -------------------

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Función para importar una colección principal
async function importTopLevelCollection(filePath, collectionName) {
  console.log(
    `[Principal] Importando ${path.basename(
      filePath
    )} a la colección '${collectionName}'...`
  );
  const records = await parseCsv(filePath);
  const batch = db.batch();

  records.forEach((record) => {
    // Aquí puedes añadir transformaciones de datos si es necesario
    const docRef = db.collection(collectionName).doc();
    batch.set(docRef, record);
  });

  await batch.commit();
  console.log(
    `✅ [Principal] ¡Éxito! Se importaron ${records.length} documentos a '${collectionName}'.\n`
  );
}

// Función para importar una sub-colección
async function importSubcollection(filePath, config) {
  const collectionName = path.basename(filePath, ".csv");
  console.log(
    `[Sub-colección] Importando ${path.basename(filePath)} a '${
      config.parentCollection
    } -> ${collectionName}'...`
  );
  const records = await parseCsv(filePath);

  for (const record of records) {
    const linkingValue = record[config.linkingField];
    if (!linkingValue) {
      console.warn(
        `  ⚠️ Saltando registro en ${path.basename(filePath)} por falta de ${
          config.linkingField
        }:`,
        record
      );
      continue;
    }

    const parentQuery = await db
      .collection(config.parentCollection)
      .where(config.linkingField, "==", linkingValue)
      .limit(1)
      .get();

    if (parentQuery.empty) {
      console.error(
        `  ❌ No se encontró un documento padre en '${config.parentCollection}' con ${config.linkingField} = ${linkingValue}. Saltando.`
      );
      continue;
    }

    const parentDoc = parentQuery.docs[0];
    const subcollectionData = { ...record };
    delete subcollectionData[config.linkingField];

    await parentDoc.ref.collection(collectionName).add(subcollectionData);
  }
  console.log(
    `✅ [Sub-colección] ¡Éxito! Proceso para '${collectionName}' completado.\n`
  );
}

// Función de utilidad para leer el CSV
function parseCsv(filePath) {
  return new Promise((resolve, reject) => {
    const data = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => data.push(row))
      .on("end", () => resolve(data))
      .on("error", (error) => reject(error));
  });
}

// --- FUNCIÓN PRINCIPAL ---
async function importAll() {
  console.log(
    "🚀 INICIANDO IMPORTACIÓN ESTRUCTURADA A FIRESTORE\n" +
      "=".repeat(60) +
      "\n"
  );

  const allFiles = fs
    .readdirSync(CSV_FOLDER)
    .filter((file) => file.endsWith(".csv"));
  const topLevelFiles = allFiles.filter(
    (file) => !SUBCOLLECTION_MAP[path.basename(file, ".csv")]
  );
  const subcollectionFiles = allFiles.filter(
    (file) => SUBCOLLECTION_MAP[path.basename(file, ".csv")]
  );

  // 1. Importar colecciones principales PRIMERO
  console.log("--- Fase 1: Importando Colecciones Principales ---");
  if (topLevelFiles.length === 0)
    console.log("No hay colecciones principales para importar.");
  for (const file of topLevelFiles) {
    const collectionName = path.basename(file, ".csv");
    await importTopLevelCollection(path.join(CSV_FOLDER, file), collectionName);
  }

  // 2. Importar sub-colecciones DESPUÉS
  console.log("\n--- Fase 2: Importando Sub-colecciones Anidadas ---");
  if (subcollectionFiles.length === 0)
    console.log("No hay sub-colecciones para importar.");
  for (const file of subcollectionFiles) {
    const collectionName = path.basename(file, ".csv");
    const config = SUBCOLLECTION_MAP[collectionName];
    await importSubcollection(path.join(CSV_FOLDER, file), config);
  }

  console.log(
    "\n" +
      "=".repeat(60) +
      "\n✨ ¡Proceso de importación finalizado! Revisa tu consola de Firestore."
  );
}

importAll().catch(console.error);
