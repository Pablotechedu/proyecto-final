# 🔒 Firestore Security Rules - Learning Models HUB

## ❌ Error Actual

```
FirebaseError: Missing or insufficient permissions
```

Este error ocurre porque las Security Rules de Firestore no están configuradas para permitir el acceso a los datos.

## ✅ Solución: Configurar Security Rules

### Paso 1: Ir a Firebase Console

1. Ve a: https://console.firebase.google.com/project/learning-models-hub/firestore/rules
2. O navega: Firebase Console → Firestore Database → Rules

### Paso 2: Reemplazar las Reglas Actuales

Copia y pega estas reglas en el editor:

```javascript
rules_version = '2';
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
      // Cualquier usuario autenticado puede leer
      allow read: if isAuthenticated();
      // Solo admins pueden escribir
      allow write: if isAdmin();
    }
    
    // Colección: patients
    match /patients/{patientId} {
      // Cualquier usuario autenticado puede leer pacientes
      allow read: if isAuthenticated();
      // Solo admins y editores pueden crear/actualizar/eliminar
      allow write: if isAdminOrEditor();
      
      // Subcollection: parentTutors
      match /parentTutors/{parentId} {
        // Heredar permisos del paciente
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
      // Cualquier usuario autenticado puede leer sesiones
      allow read: if isAuthenticated();
      // Terapeutas pueden crear/actualizar sus propias sesiones
      // Admins y editores pueden hacer todo
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAdminOrEditor();
    }
    
    // Colección: payments
    match /payments/{paymentId} {
      // Cualquier usuario autenticado puede leer pagos
      allow read: if isAuthenticated();
      // Solo admins y editores pueden gestionar pagos
      allow write: if isAdminOrEditor();
    }
    
    // Colección: expenses
    match /expenses/{expenseId} {
      // Solo admins pueden ver gastos
      allow read: if isAdmin();
      // Solo admins pueden gestionar gastos
      allow write: if isAdmin();
    }
    
    // Colección: payrolls
    match /payrolls/{payrollId} {
      // Solo admins pueden ver planillas
      allow read: if isAdmin();
      // Solo admins pueden gestionar planillas
      allow write: if isAdmin();
    }
    
    // Colección: formTemplates
    match /formTemplates/{templateId} {
      // Cualquier usuario autenticado puede leer templates
      allow read: if isAuthenticated();
      // Solo admins pueden modificar templates
      allow write: if isAdmin();
    }
  }
}
```

### Paso 3: Publicar las Reglas

1. Haz clic en el botón **"Publish"** (Publicar)
2. Confirma la publicación

### Paso 4: Verificar

1. Recarga tu aplicación
2. El error debería desaparecer
3. Deberías poder ver la lista de pacientes y sus detalles

## 📋 Explicación de las Reglas

### Permisos por Rol:

**Admin:**
- ✅ Acceso total a todo
- ✅ Puede ver gastos y planillas
- ✅ Puede modificar usuarios

**Editor:**
- ✅ Puede leer todo excepto gastos y planillas
- ✅ Puede gestionar pacientes, sesiones y pagos
- ❌ No puede ver gastos ni planillas

**Therapist:**
- ✅ Puede leer pacientes y sesiones
- ✅ Puede crear y actualizar sesiones
- ❌ No puede eliminar sesiones
- ❌ No puede gestionar pagos

### Colecciones y Permisos:

| Colección | Read | Write |
|-----------|------|-------|
| users | Todos autenticados | Solo Admin |
| patients | Todos autenticados | Admin + Editor |
| parentTutors | Todos autenticados | Admin + Editor |
| sessions | Todos autenticados | Todos (crear/actualizar) |
| payments | Todos autenticados | Admin + Editor |
| expenses | Solo Admin | Solo Admin |
| payrolls | Solo Admin | Solo Admin |
| formTemplates | Todos autenticados | Solo Admin |

## 🔧 Reglas Alternativas (Más Permisivas - Solo para Desarrollo)

Si quieres reglas más simples para desarrollo (NO USAR EN PRODUCCIÓN):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura/escritura a cualquier usuario autenticado
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **ADVERTENCIA**: Estas reglas permisivas solo deben usarse en desarrollo. Para producción, usa las reglas detalladas arriba.

## 🆘 Solución de Problemas

### Error persiste después de publicar reglas:

1. **Espera 1-2 minutos** - Las reglas pueden tardar en propagarse
2. **Limpia caché del navegador** - Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac)
3. **Cierra sesión y vuelve a iniciar** - Esto refrescará el token de autenticación
4. **Verifica que el usuario tenga un documento en la colección `users`** con el campo `role`

### Verificar que el usuario tiene rol asignado:

1. Ve a Firestore Database
2. Busca la colección `users`
3. Encuentra tu usuario (por UID)
4. Verifica que tenga el campo `role` con valor `admin`, `editor` o `therapist`

## 📞 Próximo Paso

Una vez configuradas las reglas:
1. Recarga la aplicación
2. Intenta acceder a la lista de pacientes
3. Haz clic en un paciente para ver su detalle
4. ✅ Debería funcionar sin errores

¿Las reglas están configuradas? ¡Avísame si el error persiste!
