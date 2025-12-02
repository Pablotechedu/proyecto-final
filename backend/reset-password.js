import admin from 'firebase-admin';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function resetPassword() {
  try {
    const email = 'passmind@gmail.com';
    const newPassword = 'admin123';
    
    console.log(`🔄 Cambiando contraseña para ${email}...`);
    
    // Buscar usuario
    const snapshot = await db.collection('users').where('email', '==', email).get();
    
    if (snapshot.empty) {
      console.log('❌ Usuario no encontrado');
      process.exit(1);
    }
    
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    
    // Hash de nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizar
    await userDoc.ref.update({
      password: hashedPassword,
      updatedAt: new Date()
    });
    
    console.log('✅ Contraseña actualizada exitosamente');
    console.log('📧 Email:', email);
    console.log('🔑 Nueva contraseña:', newPassword);
    console.log('👤 Permisos:', JSON.stringify(userData.permissions, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPassword();
