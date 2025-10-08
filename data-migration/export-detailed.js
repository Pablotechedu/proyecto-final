// export-detailed.js
import admin from "firebase-admin";
import { createRequire } from 'module';
import fs from 'fs';

const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function exportDetailedStructure() {
  console.log('📊 EXPORTANDO ESTRUCTURA DETALLADA DE FIRESTORE\n');
  console.log('='.repeat(60));
  
  const collections = await db.listCollections();
  const result = {};
  
  for (const collection of collections) {
    const collectionName = collection.id;
    console.log(`\n📁 Analizando colección: ${collectionName}`);
    
    const snapshot = await collection.limit(3).get(); // 3 ejemplos
    const countSnapshot = await collection.count().get();
    const count = countSnapshot.data().count;
    
    console.log(`   📊 Total de documentos: ${count}`);
    
    result[collectionName] = {
      totalDocuments: count,
      examples: []
    };
    
    if (snapshot.empty) {
      console.log(`   ⚠️  Colección vacía`);
      result[collectionName].empty = true;
      continue;
    }
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Convertir tipos especiales de Firestore a formato legible
      const cleanData = {};
      const fieldTypes = {};
      
      for (const [key, value] of Object.entries(data)) {
        // Detectar tipo de dato
        if (value === null) {
          cleanData[key] = null;
          fieldTypes[key] = 'null';
        } else if (value && typeof value.toDate === 'function') {
          // Es un Timestamp
          cleanData[key] = value.toDate().toISOString();
          fieldTypes[key] = 'Timestamp';
        } else if (value && value._path) {
          // Es una referencia a otro documento
          cleanData[key] = `Reference → ${value._path.segments.join('/')}`;
          fieldTypes[key] = 'DocumentReference';
        } else if (Array.isArray(value)) {
          cleanData[key] = value;
          fieldTypes[key] = `Array[${value.length}]`;
        } else if (typeof value === 'object' && value !== null) {
          cleanData[key] = value;
          fieldTypes[key] = 'Object';
        } else {
          cleanData[key] = value;
          fieldTypes[key] = typeof value;
        }
      }
      
      result[collectionName].examples.push({
        id: doc.id,
        data: cleanData,
        fieldTypes: fieldTypes
      });
      
      console.log(`   ✓ Documento: ${doc.id}`);
      
      // Buscar subcollections
      const subcollections = await doc.ref.listCollections();
      if (subcollections.length > 0) {
        const subNames = subcollections.map(s => s.id);
        result[collectionName].subcollections = subNames;
        console.log(`   📂 Subcollections: ${subNames.join(', ')}`);
      }
    }
  }
  
  // Guardar en archivo JSON
  const output = JSON.stringify(result, null, 2);
  const filename = './firestore-detailed.json';
  fs.writeFileSync(filename, output);
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Exportación completa guardada en: ${filename}`);
  console.log('\n📋 RESUMEN DE COLECCIONES:\n');
  
  Object.keys(result).forEach(col => {
    const info = result[col];
    const subInfo = info.subcollections ? ` (subcollections: ${info.subcollections.join(', ')})` : '';
    console.log(`  📁 ${col}: ${info.totalDocuments} documento(s)${subInfo}`);
  });
  
  console.log('\n💡 Ahora puedes compartir el archivo firestore-detailed.json');
  console.log('='.repeat(60));
  
  return result;
}

exportDetailedStructure()
  .then(() => {
    console.log('\n✨ Proceso completado exitosamente\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error durante la exportación:', error);
    process.exit(1);
  });
