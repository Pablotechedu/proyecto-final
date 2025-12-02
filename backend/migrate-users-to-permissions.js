import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateUsers() {
  try {
    console.log('🔄 Iniciando migración de usuarios a sistema de permisos...\n');
    
    const snapshot = await db.collection('users').get();
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Si ya tiene permissions, saltar
      if (data.permissions) {
        console.log(`✓ ${data.email} - Ya tiene permisos, saltando`);
        continue;
      }
      
      // Convertir role antiguo a permissions
      const permissions = {
        isAdmin: data.role === 'admin',
        isEditor: data.role === 'editor',
        isTherapist: data.role === 'therapist' || data.role === 'viewer',
        isDirector: data.isDirector === true
      };
      
      // Actualizar usuario
      await doc.ref.update({
        permissions: permissions,
        updatedAt: new Date()
      });
      
      console.log(`✅ ${data.email} migrado:`);
      console.log(`   Role antiguo: ${data.role}, isDirector: ${data.isDirector || false}`);
      console.log(`   Permisos nuevos:`, permissions);
      console.log('');
    }
    
    console.log('\n✅ Migración completada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
}

migrateUsers();
