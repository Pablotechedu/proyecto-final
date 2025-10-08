# Instrucciones de Configuración - Learning Models HUB

## Configuración de Firebase para Login

### Paso 1: Crear Proyecto Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto llamado "learning-models-hub"
3. Habilita Authentication > Sign-in method > Email/Password

### Paso 2: Obtener Configuración
1. En Project Settings > General > Your apps
2. Crea una Web App
3. Copia la configuración que se ve así:
```javascript
const firebaseConfig = {
  apiKey: "tu-api-key-real",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id"
}
```

### Paso 3: Actualizar Configuración
Reemplaza el contenido de `src/services/firebase.ts` con tu configuración real.

### Paso 4: Crear Usuarios de Prueba
En Firebase Console > Authentication > Users, agrega usuarios:
- admin@learningmodels.com (rol: admin)
- therapist@learningmodels.com (rol: therapist)

## Opción Rápida: Login de Desarrollo

Para probar inmediatamente sin Firebase, usa estas credenciales:

### Credenciales de Prueba:
- **Administrador**: 
  - Email: `admin@learningmodels.com`
  - Contraseña: `demo123`
  - Acceso: Dashboard Financiero, Gestión de Pagos, Pacientes, Sesiones

- **Editor**: 
  - Email: `editor@learningmodels.com`
  - Contraseña: `demo123`
  - Acceso: Gestión de Pagos (solo lectura), Pacientes, Sesiones

- **Terapeuta**: 
  - Email: `therapist@learningmodels.com`
  - Contraseña: `demo123`
  - Acceso: Mi Hub, Pacientes (asignados), Sesiones

### Cómo usar:
1. Ve a http://localhost:3000
2. Usa cualquiera de las credenciales de arriba
3. La aplicación detecta automáticamente que estás en modo desarrollo
4. ¡Explora todas las funcionalidades!

### Cambiar entre usuarios:
- Haz logout desde el menú de usuario (esquina superior derecha)
- Inicia sesión con diferentes credenciales para ver diferentes interfaces
