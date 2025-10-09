const admin = require('firebase-admin');
const serviceAccount = require('../functions/serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Genera un código de paciente basado en nombre y apellido
 * Formato: Nombre_Apellido01
 */
function generatePatientCode(firstName, lastName) {
  // Limpiar y capitalizar
  const cleanFirst = firstName.trim().replace(/\s+/g, '_');
  const cleanLast = lastName.trim().replace(/\s+/g, '_');
  
  // Formato: Nombre_Apellido01
  return `${cleanFirst}_${cleanLast}01`;
}

/**
 * Actualiza todos los pacientes agregando el campo patientCode
 */
async function addPatientCodes() {
  try {
    console.log('🚀 Iniciando actualización de códigos de pacientes...\n');
    
    // Obtener todos los pacientes
    const patientsSnapshot = await db.collection('patients').get();
    
    if (patientsSnapshot.empty) {
      console.log('No se encontraron pacientes.');
      return;
    }
    
    console.log(`📊 Total de pacientes: ${patientsSnapshot.size}\n`);
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    // Procesar cada paciente
    for (const doc of patientsSnapshot.docs) {
      const patient = doc.data();
      const patientId = doc.id;
      
      try {
        // Si ya tiene patientCode, omitir
        if (patient.patientCode) {
          console.log(`⏭️  ${patient.firstName} ${patient.lastName} - Ya tiene código: ${patient.patientCode}`);
          skipped++;
          continue;
        }
        
        // Generar código
        const patientCode = generatePatientCode(patient.firstName, patient.lastName);
        
        // Actualizar documento
        await db.collection('patients').doc(patientId).update({
          patientCode: patientCode
        });
        
        console.log(`✅ ${patient.firstName} ${patient.lastName} - Código agregado: ${patientCode}`);
        updated++;
        
      } catch (error) {
        console.error(`❌ Error con ${patient.firstName} ${patient.lastName}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n📈 Resumen:');
    console.log(`   ✅ Actualizados: ${updated}`);
    console.log(`   ⏭️  Omitidos (ya tenían código): ${skipped}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log('\n✨ Proceso completado!');
    
  } catch (error) {
    console.error('❌ Error general:', error);
    throw error;
  }
}

/**
 * Función para verificar códigos duplicados
 */
async function checkDuplicateCodes() {
  try {
    console.log('\n🔍 Verificando códigos duplicados...\n');
    
    const patientsSnapshot = await db.collection('patients').get();
    const codes = {};
    const duplicates = [];
    
    patientsSnapshot.forEach(doc => {
      const patient = doc.data();
      if (patient.patientCode) {
        if (codes[patient.patientCode]) {
          duplicates.push({
            code: patient.patientCode,
            patients: [codes[patient.patientCode], `${patient.firstName} ${patient.lastName}`]
          });
        } else {
          codes[patient.patientCode] = `${patient.firstName} ${patient.lastName}`;
        }
      }
    });
    
    if (duplicates.length > 0) {
      console.log('⚠️  Códigos duplicados encontrados:');
      duplicates.forEach(dup => {
        console.log(`   ${dup.code}: ${dup.patients.join(', ')}`);
      });
      console.log('\n💡 Sugerencia: Agrega un número diferente al final (02, 03, etc.)');
    } else {
      console.log('✅ No se encontraron códigos duplicados');
    }
    
  } catch (error) {
    console.error('Error verificando duplicados:', error);
  }
}

/**
 * Función para actualizar un código específico manualmente
 */
async function updateSpecificCode(patientId, newCode) {
  try {
    await db.collection('patients').doc(patientId).update({
      patientCode: newCode
    });
    console.log(`✅ Código actualizado para paciente ${patientId}: ${newCode}`);
  } catch (error) {
    console.error('Error actualizando código:', error);
  }
}

// Ejecutar script
async function main() {
  try {
    // Agregar códigos a todos los pacientes
    await addPatientCodes();
    
    // Verificar duplicados
    await checkDuplicateCodes();
    
    console.log('\n📝 Notas importantes:');
    console.log('1. Verifica que los códigos coincidan con los usados en Google Calendar');
    console.log('2. Si hay duplicados, actualízalos manualmente en Firestore');
    console.log('3. El formato debe ser exactamente: Nombre_Apellido## (ej: Alexia_Urcuyo01)');
    
    process.exit(0);
  } catch (error) {
    console.error('Error en el proceso:', error);
    process.exit(1);
  }
}

// Ejecutar
main();
