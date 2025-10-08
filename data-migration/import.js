// scripts/import.js
import admin from "firebase-admin";
import fs, { readdirSync } from "fs";
import csv from "csv-parser";
import path from "path";
import { createRequire } from "module";

// Importar JSON de forma compatible
const require = createRequire(import.meta.url);
const serviceAccount = require("./serviceAccountKey.json");

// --- CONFIGURACIÓN ---
const CSV_FOLDER = "./"; // Carpeta donde están los CSV
const EXCLUDED_FILES = [
  "serviceAccountKey.json",
  "import.js",
  "All Tables.xlsx",
]; // Archivos a ignorar
// -------------------

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Auto-detectar todos los archivos CSV en la carpeta
function detectCsvFiles() {
  console.log(`📁 Buscando archivos CSV en: ${CSV_FOLDER}\n`);

  const csvFiles = readdirSync(CSV_FOLDER)
    .filter((file) => {
      const isCSV = file.endsWith(".csv");
      const notExcluded = !EXCLUDED_FILES.includes(file);
      return isCSV && notExcluded;
    })
    .map((file) => ({
      csvFile: path.join(CSV_FOLDER, file),
      collection: file.replace(".csv", ""), // Nombre de colección = nombre del archivo
      fileName: file,
    }));

  if (csvFiles.length === 0) {
    console.log("⚠️  No se encontraron archivos CSV para importar.");
    return [];
  }

  console.log(`✅ Encontrados ${csvFiles.length} archivo(s) CSV:`);
  csvFiles.forEach((config) => {
    console.log(`   • ${config.fileName} → colección "${config.collection}"`);
  });
  console.log("");

  return csvFiles;
}

// Factory function para crear importadores
function createImporter(config) {
  return async function () {
    console.log(`📥 Importando: ${config.fileName}...`);

    const results = [];

    return new Promise((resolve, reject) => {
      // Verificar si el archivo existe
      if (!fs.existsSync(config.csvFile)) {
        console.log(`   ⚠️  Archivo no encontrado, saltando...\n`);
        resolve();
        return;
      }

      fs.createReadStream(config.csvFile)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
          if (results.length === 0) {
            console.log(
              `   ⚠️  Archivo vacío (solo encabezados), saltando...\n`
            );
            resolve();
            return;
          }

          console.log(`   📊 Leídos ${results.length} registro(s)`);

          // Usar batch para subir los datos
          const batch = db.batch();

          results.forEach((record) => {
            // Aquí puedes agregar transformaciones si es necesario
            // Por ejemplo: convertir fechas, parsear números, etc.
            const docRef = db.collection(config.collection).doc();
            batch.set(docRef, record);
          });

          try {
            await batch.commit();
            console.log(
              `   ✅ ${results.length} documento(s) importado(s) a "${config.collection}"\n`
            );
            resolve();
          } catch (error) {
            console.error(
              `   ❌ Error al importar a "${config.collection}":`,
              error.message
            );
            console.log("");
            reject(error);
          }
        })
        .on("error", (error) => {
          console.error(
            `   ❌ Error al leer ${config.fileName}:`,
            error.message
          );
          console.log("");
          reject(error);
        });
    });
  };
}

// Función principal para importar todos los archivos
async function importAll() {
  console.log("🚀 INICIANDO IMPORTACIÓN MASIVA DE CSV A FIRESTORE\n");
  console.log("=".repeat(60));
  console.log("");

  const csvConfigs = detectCsvFiles();

  if (csvConfigs.length === 0) {
    console.log("No hay archivos para importar. Saliendo...");
    return;
  }

  console.log("=".repeat(60));
  console.log("\n🔄 Procesando archivos...\n");

  let successCount = 0;
  let errorCount = 0;

  for (const config of csvConfigs) {
    try {
      const importer = createImporter(config);
      await importer();
      successCount++;
    } catch (error) {
      errorCount++;
      // Continuar con el siguiente archivo aunque haya error
    }
  }

  console.log("=".repeat(60));
  console.log("\n📊 RESUMEN DE IMPORTACIÓN:");
  console.log(`   ✅ Exitosos: ${successCount}`);
  console.log(`   ❌ Errores: ${errorCount}`);
  console.log(`   📁 Total procesados: ${csvConfigs.length}`);
  console.log("\n✨ ¡Importación completa!");
  console.log("=".repeat(60));
}

// Ejecutar
importAll().catch((error) => {
  console.error("\n💥 Error fatal en la importación:", error);
  process.exit(1);
});
