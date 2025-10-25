# 🔐 Google Sign-In - Guía de Configuración y Uso

## ✅ Estado Actual

### Configuración Completada
- ✅ Google Sign-In habilitado en Firebase Console
- ✅ Código implementado en `useAuth.tsx`
- ✅ Interfaz de usuario actualizada en `Login.tsx`
- ✅ Auto-creación de usuarios en Firestore
- ✅ Asignación automática de roles

---

## 🎯 Cómo Funciona

### Flujo de Autenticación

```
Usuario hace click en "Continuar con Google"
    ↓
Se abre popup de Google
    ↓
Usuario selecciona su cuenta de Google
    ↓
Sistema valida el dominio del email
    ↓
¿Email autorizado?
    ├─ @learningmodels.com.gt → ✅ Permitido
    ├─ @gmail.com → ✅ Permitido (solo admins)
    └─ Otro dominio → ❌ Rechazado
    ↓
¿Usuario existe en Firestore?
    ├─ SÍ → Cargar datos existentes
    └─ NO → Crear usuario automáticamente
    ↓
Asignar rol según email
    ↓
Redirigir al Dashboard o Therapist Hub
```

---

## 👥 Asignación Automática de Roles

### Reglas de Asignación

| Email | Rol | Permisos Especiales |
|-------|-----|---------------------|
| `monica@learningmodels.com.gt` | `admin` | ✅ Director (acceso completo) |
| `fernanda@learningmodels.com.gt` | `editor` | Edición de contenido |
| Otros `@learningmodels.com.gt` | `therapist` | Gestión de sesiones |
| `@gmail.com` | Según Firestore | Solo si ya existe en BD |

### Estructura en Firestore

Cuando un usuario inicia sesión por primera vez, se crea automáticamente:

```javascript
// Colección: users
// Documento ID: [Firebase Auth UID]
{
  email: "usuario@learningmodels.com.gt",
  name: "Nombre del Usuario", // De Google o email
  role: "therapist", // Asignado automáticamente
  createdAt: "2025-01-09T13:24:00.000Z"
}
```

---

## 🔐 Seguridad

### Dominios Autorizados

1. **@learningmodels.com.gt** (Google Workspace)
   - Cualquier usuario del dominio puede acceder
   - Rol asignado automáticamente
   - Creación automática de cuenta

2. **@gmail.com** (Administradores)
   - Solo para cuentas pre-existentes en Firestore
   - Útil para administradores externos
   - No se crean automáticamente

### Validación de Seguridad

```typescript
// El sistema valida:
1. Dominio del email
2. Existencia en Firestore (para @gmail.com)
3. Permisos según rol
4. Cierra sesión si no está autorizado
```

---

## 🖥️ Interfaz de Usuario

### Pantalla de Login

**Opción Principal: Google Sign-In**
- Botón blanco con logo de Google
- Estilo similar a Google oficial
- Texto: "Continuar con Google"

**Opción Secundaria: Email/Password**
- Separador con texto "o usa email y contraseña"
- Formulario tradicional
- Útil para cuentas @gmail.com de admins

---

## 📝 Uso para Usuarios

### Para Terapeutas (@learningmodels.com.gt)

1. Ir a la página de login
2. Click en "Continuar con Google"
3. Seleccionar cuenta de Google Workspace
4. ✅ Acceso automático al sistema

**Primera vez:**
- Se crea cuenta automáticamente
- Rol: `therapist` (por defecto)
- Redirige a Therapist Hub

**Siguientes veces:**
- Login instantáneo
- Mantiene rol y configuración

### Para Mónica (Admin/Director)

1. Click en "Continuar con Google"
2. Seleccionar `monica@learningmodels.com.gt`
3. ✅ Acceso con permisos de admin + director

**Permisos especiales:**
- `role: 'admin'`
- `isDirector: true`
- Acceso completo al sistema

### Para Fernanda (Editor)

1. Click en "Continuar con Google"
2. Seleccionar `fernanda@learningmodels.com.gt`
3. ✅ Acceso con permisos de editor

### Para Admins Externos (@gmail.com)

1. Usar formulario de email/password
2. O usar "Continuar con Google" si ya existe en Firestore
3. ✅ Acceso según rol asignado

---

## 🔧 Configuración Técnica

### Archivos Modificados

1. **`src/hooks/useAuth.tsx`**
   - Agregado `loginWithGoogle()` function
   - Agregado `createOrUpdateUser()` helper
   - Validación de dominio
   - Auto-creación de usuarios

2. **`src/pages/Login.tsx`**
   - Botón de Google Sign-In
   - Manejo de estados de carga
   - Mensajes de error mejorados

### Dependencias

```typescript
// Firebase Auth
import { 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth'

// Firestore
import { 
  doc, 
  getDoc, 
  setDoc 
} from 'firebase/firestore'
```

---

## 🚀 Despliegue

### Verificar Dominios Autorizados en Firebase

1. Ve a: Firebase Console → Authentication → Settings
2. Sección: **Authorized domains**
3. Asegúrate que estén agregados:
   - `localhost` (desarrollo)
   - `learning-models-hub.web.app` (producción)
   - Tu dominio personalizado (si aplica)

### Comandos de Despliegue

```bash
# Desarrollo local
npm run dev

# Build para producción
npm run build

# Desplegar a Firebase Hosting
firebase deploy --only hosting
```

---

## 🧪 Testing

### Casos de Prueba

#### ✅ Caso 1: Usuario Nuevo de Learning Models
1. Login con `ximena@learningmodels.com.gt`
2. Verificar creación en Firestore
3. Verificar rol: `therapist`
4. Verificar redirección a Therapist Hub

#### ✅ Caso 2: Mónica (Admin)
1. Login con `monica@learningmodels.com.gt`
2. Verificar rol: `admin`
3. Verificar `isDirector: true`
4. Verificar acceso completo

#### ✅ Caso 3: Fernanda (Editor)
1. Login con `fernanda@learningmodels.com.gt`
2. Verificar rol: `editor`
3. Verificar permisos de edición

#### ✅ Caso 4: Admin Externo (@gmail.com)
1. Login con cuenta @gmail.com existente
2. Verificar que funciona
3. Intentar con @gmail.com NO existente
4. Verificar rechazo

#### ❌ Caso 5: Dominio No Autorizado
1. Intentar login con `usuario@otrodominio.com`
2. Verificar mensaje de error
3. Verificar que se cierra sesión automáticamente

---

## 🆘 Troubleshooting

### Error: "Solo se permiten cuentas de @learningmodels.com.gt"

**Causa:** Email no autorizado

**Solución:**
- Usar cuenta de Google Workspace
- O usar email/password si eres admin externo

### Error: "Inicio de sesión cancelado"

**Causa:** Usuario cerró el popup de Google

**Solución:**
- Intentar nuevamente
- Asegurarse de completar el proceso

### Error: "Google Sign-In no está disponible en modo desarrollo"

**Causa:** Intentando usar Google Sign-In en modo demo

**Solución:**
- Usar credenciales de demo
- O configurar Firebase correctamente

### Usuario no aparece en Firestore

**Causa:** Error en la creación automática

**Solución:**
1. Verificar permisos de Firestore
2. Revisar reglas de seguridad
3. Verificar logs en consola

---

## 📊 Monitoreo

### Ver Usuarios Autenticados

```bash
# Firebase Console
Authentication → Users

# Firestore
Database → users (colección)
```

### Logs de Autenticación

```javascript
// En el navegador (DevTools Console)
// Los errores se muestran automáticamente

// En Firebase Console
Authentication → Usage
```

---

## 🔄 Migración de Usuarios Existentes

### Si ya tienes usuarios con email/password

**Opción 1: Mantener ambos métodos**
- Los usuarios pueden seguir usando email/password
- O cambiar a Google Sign-In cuando quieran

**Opción 2: Migración gradual**
1. Usuario hace login con Google por primera vez
2. Sistema detecta email existente en Firestore
3. Vincula cuenta de Google con datos existentes
4. Usuario puede usar cualquier método

---

## 📚 Referencias

- [Firebase Authentication - Google](https://firebase.google.com/docs/auth/web/google-signin)
- [Google Sign-In Best Practices](https://developers.google.com/identity/sign-in/web/sign-in)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

## ✅ Checklist de Implementación

- [x] Google Sign-In habilitado en Firebase
- [x] Código de autenticación implementado
- [x] Interfaz de usuario actualizada
- [x] Auto-creación de usuarios configurada
- [x] Asignación de roles automática
- [x] Validación de dominios
- [x] Manejo de errores
- [ ] Testing en producción
- [ ] Capacitación a usuarios
- [ ] Monitoreo activo

---

## 🎯 Próximos Pasos

1. **Desplegar a producción**
   ```bash
   npm run build
   firebase deploy
   ```

2. **Probar con usuarios reales**
   - Mónica prueba con su cuenta
   - Cada terapeuta prueba su acceso
   - Verificar roles y permisos

3. **Capacitar al equipo**
   - Mostrar cómo usar Google Sign-In
   - Explicar que es más seguro
   - Resolver dudas

4. **Monitorear**
   - Revisar logs de autenticación
   - Verificar creación de usuarios
   - Ajustar roles si es necesario

---

**¿Necesitas ayuda?** Revisa los logs en:
- Consola del navegador (F12)
- Firebase Console → Authentication
- Firebase Console → Firestore
