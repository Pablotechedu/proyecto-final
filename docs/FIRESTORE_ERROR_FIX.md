# 🔧 Solución de Errores de Firestore

## ❌ Error que estás viendo:

```
WebChannelConnection RPC 'Listen' stream transport errored
GET https://firestore.googleapis.com/...  400 (Bad Request)
```

## ✅ Qué significa:

Este error indica que:
1. ✅ Firebase **SÍ está configurado** correctamente
2. ✅ La aplicación **SÍ está intentando** conectarse a Firestore
3. ❌ **Firestore NO está habilitado** en tu proyecto Firebase

## 🚀 Solución (5 minutos):

### Paso 1: Habilitar Firestore Database

1. **Ve a Firebase Console**:
   ```
   https://console.firebase.google.com/project/learning-models-hub/firestore
   ```

2. **Haz clic en "Create Database"** (o "Crear base de datos")

3. **Selecciona el modo**:
   - Opción recomendada: **"Start in production mode"**
   - Ubicación: **us-central1** (o la más cercana a Guatemala)

4. **Haz clic en "Enable"** (Habilitar)

### Paso 2: Configurar Reglas de Seguridad

Una vez creada la base de datos:

1. **Ve a la pestaña "Rules"** en Firestore

2. **Pega estas reglas temporales** (para desarrollo):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura/escritura a usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. **Haz clic en "Publish"**

### Paso 3: Verificar que funciona

1. **Recarga la aplicación** en el navegador
2. **Los errores deberían desaparecer**
3. **Intenta hacer login** - ahora debería funcionar

## 📋 Reglas de Seguridad Recomendadas (Para Producción)

Una vez que todo funcione, actualiza las reglas a estas más seguras:

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
      allow write: if request.auth != null && 
        (request.auth.uid == userId || getUserRole() == 'admin');
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

## 🎯 Checklist de Verificación

Después de habilitar Firestore:

- [ ] Firestore Database creado
- [ ] Reglas de seguridad configuradas
- [ ] Aplicación recargada
- [ ] Errores 400 desaparecieron
- [ ] Login funciona correctamente

## 🔍 Cómo verificar que está funcionando:

1. **Abre la consola del navegador** (F12)
2. **Intenta hacer login**
3. **Deberías ver**:
   - ✅ Sin errores de Firestore
   - ✅ Conexión exitosa
   - ✅ Login funcional

## 💡 Nota Importante:

Los errores que viste son **BUENOS** porque confirman que:
- Firebase está configurado
- La aplicación está intentando conectarse
- Solo falta habilitar Firestore

Una vez habilitado, todo funcionará perfectamente.

## 🆘 Si sigues viendo errores:

1. **Verifica que Firestore esté habilitado**:
   - Ve a Firebase Console
   - Busca "Firestore Database" en el menú
   - Debería decir "Cloud Firestore" (no "Realtime Database")

2. **Verifica las reglas**:
   - Deben permitir acceso a usuarios autenticados
   - `allow read, write: if request.auth != null;`

3. **Limpia caché del navegador**:
   - Ctrl + Shift + R (Windows/Linux)
   - Cmd + Shift + R (Mac)

## 📞 Próximo Paso:

Una vez habilitado Firestore, necesitarás:
1. Crear usuarios en Authentication
2. Crear documentos de usuario en Firestore
3. ¡Listo para usar la aplicación!

¿Necesitas ayuda con alguno de estos pasos?
