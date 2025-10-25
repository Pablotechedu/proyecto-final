const admin = require('firebase-admin');
const serviceAccount = require('../functions/serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Contraseña temporal para todos los usuarios
const TEMP_PASSWORD = 'LearningModels2025!';

// Usuarios a crear (Mónica ya existe, solo crear el resto)
const USERS_TO_CREATE = [
  {
    email: 'ximena@learningmodels.com.gt',
    name: 'Ximena',
    role: 'therapist'
  },
  {
    email: 'miranda@learningmodels.com.gt',
    name: 'Miranda Navas',
    role: 'therapist'
  },
  {
    email: 'fernanda@learningmodels.com.gt',
    name: 'Fernanda Muñoz',
    role: 'editor'
  },
  {
    email: 'mariajimena@learningmodels.com.gt',
    name: 'María Jimena',
    role: 'therapist'
  }
];

// Usuario existente (Mónica)
const EXISTING_USER = {
  email: 'monica@learningmodels.com.gt',
  uid: 'gENhg7u2GJdQnnRuge6ZRleu1ih1',
  name: 'Mónica de Aguilar',
  role: 'admin',
  isDirector: true
};

/**
 * Crea un usuario en Firebase Authentication
 */
async function createAuthUser(email, password, displayName) {
  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName,
      emailVerified: false
    });
    
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log(`   ⚠️  Usuario ya existe en Authentication: ${email}`);
      // Obtener el usuario existente
      const existingUser = await admin.auth().getUserByEmail(email);
      return existingUser;
    }
    throw error;
  }
}

/**
 * Crea o actualiza un documento de usuario en Firestore
 */
async function createFirestoreUser(uid, email, name, role, isDirector = false) {
  try {
    const userData = {
      email: email,
      name: name,
      role: role,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (isDirector) {
      userData.isDirector = true;
    }
    
    await db.collection('users').doc(uid).set(userData, { merge: true });
    
    return userData;
  } catch (error) {
    console.error(`   ❌ Error creando documento en Firestore para ${email}:`, error.message);
    throw error;
  }
}

/**
 * Crea todos los usuarios
 */
async function createAllUsers() {
  try {
    console.log('🚀 Iniciando creación de usuarios...\n');
    console.log(`🔑 Contraseña temporal: ${TEMP_PASSWORD}\n`);
    console.log('─'.repeat(60));
    
    const createdUsers = [];
    const errors = [];
    
    // Mostrar usuario existente (Mónica)
    console.log('\n📌 Usuario Existente:\n');
    console.log(`✅ ${EXISTING_USER.email}`);
    console.log(`   UID: ${EXISTING_USER.uid}`);
    console.log(`   Nombre: ${EXISTING_USER.name}`);
    console.log(`   Rol: ${EXISTING_USER.role} (Director)`);
    
    createdUsers.push({
      email: EXISTING_USER.email,
      uid: EXISTING_USER.uid,
      name: EXISTING_USER.name,
      role: EXISTING_USER.role,
      isDirector: EXISTING_USER.isDirector
    });
    
    console.log('\n─'.repeat(60));
    console.log('\n🆕 Creando Nuevos Usuarios:\n');
    
    // Crear cada usuario
    for (const user of USERS_TO_CREATE) {
      try {
        console.log(`📝 Procesando: ${user.email}`);
        
        // Crear en Authentication
        const authUser = await createAuthUser(user.email, TEMP_PASSWORD, user.name);
        console.log(`   ✅ Authentication: UID ${authUser.uid}`);
        
        // Crear en Firestore
        await createFirestoreUser(authUser.uid, user.email, user.name, user.role);
        console.log(`   ✅ Firestore: Documento creado`);
        console.log(`   👤 Nombre: ${user.name}`);
        console.log(`   🎭 Rol: ${user.role}`);
        console.log('');
        
        createdUsers.push({
          email: user.email,
          uid: authUser.uid,
          name: user.name,
          role: user.role
        });
        
      } catch (error) {
        console.error(`   ❌ Error con ${user.email}:`, error.message);
        errors.push({
          email: user.email,
          error: error.message
        });
        console.log('');
      }
    }
    
    console.log('─'.repeat(60));
    console.log('\n📊 Resumen:\n');
    console.log(`   ✅ Usuarios totales: ${createdUsers.length}`);
    console.log(`   🆕 Nuevos creados: ${createdUsers.length - 1}`);
    console.log(`   ❌ Errores: ${errors.length}`);
    
    // Exportar IDs a archivo JSON
    const outputData = {
      users: createdUsers,
      calendarMapping: {},
      timestamp: new Date().toISOString()
    };
    
    // Crear mapeo para syncCalendar.js
    createdUsers.forEach(user => {
      outputData.calendarMapping[user.email] = user.uid;
    });
    
    const fs = require('fs');
    const outputPath = './users-created.json';
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    
    console.log(`\n📄 Datos exportados a: ${outputPath}`);
    
    // Mostrar mapeo para syncCalendar.js
    console.log('\n─'.repeat(60));
    console.log('\n📋 Mapeo para syncCalendar.js:\n');
    console.log('const CALENDAR_THERAPIST_MAP = {');
    createdUsers.forEach((user, index) => {
      const comma = index < createdUsers.length - 1 ? ',' : '';
      console.log(`  '${user.email}': '${user.uid}'${comma}`);
    });
    console.log('};');
    
    // Mostrar credenciales
    console.log('\n─'.repeat(60));
    console.log('\n🔐 Credenciales de Acceso:\n');
    console.log(`Contraseña temporal para todos: ${TEMP_PASSWORD}\n`);
    
    createdUsers.forEach(user => {
      if (user.email !== EXISTING_USER.email) {
        console.log(`📧 ${user.email}`);
        console.log(`   Contraseña: ${TEMP_PASSWORD}`);
        console.log(`   Rol: ${user.role}`);
        console.log('');
      }
    });
    
    console.log('─'.repeat(60));
    console.log('\n💡 Notas Importantes:\n');
    console.log('1. Los usuarios pueden cambiar su contraseña después del primer login');
    console.log('2. Con Google Sign-In habilitado, pueden usar su cuenta de Google Workspace');
    console.log('3. Los IDs están guardados en users-created.json');
    console.log('4. Copia el mapeo de arriba a functions/syncCalendar.js\n');
    
    if (errors.length > 0) {
      console.log('⚠️  Errores encontrados:\n');
      errors.forEach(err => {
        console.log(`   ${err.email}: ${err.error}`);
      });
      console.log('');
    }
    
    console.log('✨ Proceso completado!\n');
    
  } catch (error) {
    console.error('❌ Error general:', error);
    throw error;
  }
}

// Ejecutar script
createAllUsers()
  .then(() => {
    console.log('👋 Script finalizado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
