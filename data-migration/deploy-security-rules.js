// deploy-security-rules.js
import admin from "firebase-admin";
import { createRequire } from 'module';
import { readFileSync } from 'fs';

const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Reglas de seguridad de Firestore
const securityRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function para obtener el rol del usuario
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    // Helper function para verificar si el usuario está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function para verificar si es admin
    function isAdmin() {
      return isAuthenticated() && getUserRole() == 'admin';
    }
    
    // Helper function para verificar si es admin o editor
    function isAdminOrEditor() {
      return isAuthenticated() && (getUserRole() == 'admin' || getUserRole() == 'editor');
    }
    
    // Colección: users
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Colección: patients
    match /patients/{patientId} {
      allow read: if isAuthenticated();
      allow write: if isAdminOrEditor();
      
      // Subcollection: parentTutors
      match /parentTutors/{parentId} {
        allow read: if isAuthenticated();
        allow write: if isAdminOrEditor();
      }
      
      // Subcollection: relatedProfessionals
      match /relatedProfessionals/{professionalId} {
        allow read: if isAuthenticated();
        allow write: if isAdminOrEditor();
      }
    }
    
    // Colección: sessions
    match /sessions/{sessionId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAdminOrEditor();
    }
    
    // Colección: payments
    match /payments/{paymentId} {
      allow read: if isAuthenticated();
      allow write: if isAdminOrEditor();
    }
    
    // Colección: expenses
    match /expenses/{expenseId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    // Colección: payrolls
    match /payrolls/{payrollId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    // Colección: formTemplates
    match /formTemplates/{templateId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}`;

async function deploySecurityRules() {
  console.log('🔒 DESPLEGANDO SECURITY RULES DE FIRESTORE\n');
  console.log('='.repeat(60));
  
  try {
    // Nota: Firebase Admin SDK no puede desplegar Security Rules directamente
    // Necesitamos usar la Firebase Management API
    
    console.log('\n⚠️  IMPORTANTE:');
    console.log('Firebase Admin SDK no puede desplegar Security Rules directamente.');
    console.log('Las reglas deben configurarse manualmente en Firebase Console.\n');
    
    console.log('📋 OPCIONES PARA DESPLEGAR LAS REGLAS:\n');
    
    console.log('OPCIÓN 1: Firebase Console (Recomendado)');
    console.log('1. Ve a: https://console.firebase.google.com/project/learning-models-hub/firestore/rules');
    console.log('2. Copia las reglas del archivo que se creará');
    console.log('3. Pégalas en el editor');
    console.log('4. Haz clic en "Publish"\n');
    
    console.log('OPCIÓN 2: Firebase CLI');
    console.log('1. Instala Firebase CLI: npm install -g firebase-tools');
    console.log('2. Ejecuta: firebase login');
    console.log('3. Ejecuta: firebase deploy --only firestore:rules\n');
    
    // Guardar las reglas en un archivo
    const rulesFilePath = './firestore.rules';
    const fs = await import('fs');
    fs.writeFileSync(rulesFilePath, securityRules);
    
    console.log('✅ Reglas guardadas en:', rulesFilePath);
    console.log('\n📄 CONTENIDO DE LAS REGLAS:\n');
    console.log('='.repeat(60));
    console.log(securityRules);
    console.log('='.repeat(60));
    
    console.log('\n💡 PRÓXIMOS PASOS:');
    console.log('1. Copia el contenido de firestore.rules');
    console.log('2. Ve a Firebase Console');
    console.log('3. Pega las reglas y publica');
    console.log('\nO usa Firebase CLI para desplegar automáticamente.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

deploySecurityRules()
  .then(() => {
    console.log('\n✨ Proceso completado\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
