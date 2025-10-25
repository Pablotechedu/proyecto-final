# 🔍 Guía de Verificación Firebase - Learning Models HUB

## ✅ Estado Actual: FIREBASE CONFIGURADO

Tu aplicación **YA está usando Firebase real** con el proyecto:
- **Proyecto**: `learning-models-hub`
- **API Key**: `AIzaSyBTkUMeJkDRRZ-PmAgBZHWWUkFBqk9-sn8`
- **Auth Domain**: `learning-models-hub.firebaseapp.com`

## 🎯 Cómo Verificar que Está Usando Firebase

### Método 1: Verificar en el Código
La aplicación detecta automáticamente si está en modo demo o producción:
```javascript
// En useAuth.tsx línea 64:
const isDevelopmentMode = auth.app.options.apiKey === 'your-api-key'

// Tu API key es: AIzaSyBTkUMeJkDRRZ-PmAgBZHWWUkFBqk9-sn8
// Por lo tanto: isDevelopmentMode = false
// ✅ Está en MODO PRODUCCIÓN (Firebase real)
```

### Método 2: Probar Login Real
1. Abre la aplicación: http://localhost:3000
2. Intenta login con usuarios demo:
   - Email: `admin@learningmodels.com`
   - Password: `demo123`
3. **Si ves error de Firebase** = ✅ Está usando Firebase real
4. **Si entra sin error** = ❌ Está en modo demo

### Método 3: Verificar en Firebase Console
1. Ve a: https://console.firebase.google.com/
2. Busca proyecto: `learning-models-hub`
3. Ve a Authentication > Users
4. Si ves usuarios = ✅ Firebase activo

### Método 4: Verificar en DevTools del Navegador
1. Abre la aplicación
2. Presiona F12 (DevTools)
3. Ve a Console
4. Intenta hacer login
5. Busca mensajes de Firebase:
   - ✅ "Firebase: Error (auth/...)" = Firebase real
   - ❌ "Credenciales inválidas. Usa: admin@..." = Modo demo

## 🔧 Próximos Pasos para Usar Firebase

### Paso 1: Crear Usuarios en Firebase Console

1. **Ve a Firebase Console**:
   ```
   https://console.firebase.google.com/project/learning-models-hub/authentication/users
   ```

2. **Habilita Email/Password**:
   - Authentication > Sign-in method
   - Habilita "Email/Password"
   - Guarda

3. **Crea Usuarios del Equipo**:
   ```
   Click "Add user"
   
   Usuario 1 (Admin):
   - Email: monica@learningmodels.com.gt
   - Password: [contraseña segura]
   
   Usuario 2 (Terapeuta):
   - Email: miranda@learningmodels.com.gt
   - Password: [contraseña segura]
   
   Usuario 3 (Editor):
   - Email: fernanda@learningmodels.com.gt
   - Password: [contraseña segura]
   ```

### Paso 2: Crear Documentos de Usuario en Firestore

Para cada usuario creado, necesitas crear un documento en Firestore:

1. **Ve a Firestore Database**:
   ```
   https://console.firebase.google.com/project/learning-models-hub/firestore
   ```

2. **Crea la colección `users`** (si no existe)

3. **Para cada usuario, crea un documento**:
   ```
   Colección: users
   ID del documento: [UID del usuario de Authentication]
   
   Campos:
   - name: "Mónica de Aguilar"
   - email: "monica@learningmodels.com.gt"
   - role: "admin"  // o "editor" o "therapist"
   ```

### Paso 3: Configurar Reglas de Seguridad

1. **Ve a Firestore > Rules**

2. **Pega estas reglas**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check user role
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && getUserRole() == 'admin';
    }
    
    // Patients collection
    match /patients/{patientId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (getUserRole() == 'admin' || getUserRole() == 'editor');
    }
    
    // Sessions collection
    match /sessions/{sessionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Payments collection
    match /payments/{paymentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (getUserRole() == 'admin' || getUserRole() == 'editor');
    }
  }
}
```

## 🧪 Pruebas de Verificación

### Test 1: Login con Usuario Real
```bash
1. Crea un usuario en Firebase Console
2. Crea su documento en Firestore
3. Intenta login en la app
4. ✅ Debería entrar exitosamente
```

### Test 2: Verificar Roles
```bash
1. Login como admin
2. Deberías ver: Dashboard, Pagos, Pacientes, Sesiones
3. Login como therapist
4. Deberías ver: Mi Hub, Pacientes (asignados)
```

### Test 3: Verificar Firestore
```bash
1. Login exitoso
2. Ve a Firestore Console
3. Busca en colección 'users'
4. ✅ Deberías ver el documento del usuario
```

## 🚨 Solución de Problemas

### Error: "Firebase: Error (auth/user-not-found)"
✅ **Esto es BUENO** - Significa que Firebase está funcionando
❌ Solo necesitas crear el usuario en Firebase Console

### Error: "Firebase: Error (auth/wrong-password)"
✅ Firebase funcionando correctamente
❌ Verifica la contraseña

### Error: "Permission denied"
❌ Falta configurar reglas de Firestore
✅ Sigue el Paso 3 arriba

### No hay errores pero no entra
❌ Puede estar en modo demo
✅ Verifica que apiKey no sea 'your-api-key'

## 📊 Checklist de Configuración Completa

- [x] Firebase configurado en código
- [ ] Email/Password habilitado en Firebase Console
- [ ] Usuarios creados en Authentication
- [ ] Documentos de usuarios en Firestore
- [ ] Reglas de seguridad configuradas
- [ ] Login probado exitosamente

## 🎯 Comando Rápido de Verificación

Ejecuta esto en la consola del navegador (F12):
```javascript
// Verifica si está usando Firebase real
console.log('API Key:', firebase.app().options.apiKey);
console.log('Modo:', firebase.app().options.apiKey === 'your-api-key' ? 'DEMO' : 'PRODUCCIÓN');
```

## 📞 Siguiente Paso Recomendado

1. **Ahora mismo**: Ve a Firebase Console y crea tu primer usuario
2. **URL directa**: https://console.firebase.google.com/project/learning-models-hub/authentication/users
3. **Tiempo estimado**: 5 minutos
4. **Resultado**: Login real funcionando

¿Necesitas ayuda con algún paso específico?
