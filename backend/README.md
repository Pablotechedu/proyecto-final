# Hub Terapias - Backend API REST

Backend API REST para el sistema de gestión de terapias, construido con Node.js, Express y Firebase Firestore.

## 🚀 Stack Tecnológico

- **Node.js** v18+
- **Express.js** - Framework web
- **Firebase Admin SDK** - Base de datos (Firestore)
- **JWT** - Autenticación
- **bcryptjs** - Hash de contraseñas
- **Multer** - Upload de archivos

## 📋 Requisitos Previos

1. Node.js v18 o superior
2. npm o yarn
3. Proyecto de Firebase creado (hub-terapias)
4. Service Account Key de Firebase

## 🔧 Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita `.env` y configura:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=tu_secret_super_seguro_cambialo
JWT_EXPIRE=7d
FIREBASE_PROJECT_ID=hub-terapias
FRONTEND_URL=http://localhost:5173
```

### 3. Descargar Service Account Key

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona el proyecto **hub-terapias**
3. Ve a **Project Settings** (⚙️) → **Service Accounts**
4. Click en **Generate new private key**
5. Guarda el archivo como `serviceAccountKey.json` en la carpeta `backend/`

⚠️ **IMPORTANTE**: Nunca subas este archivo a Git. Ya está en `.gitignore`.

## 🏃 Ejecutar el Servidor

### Modo desarrollo (con nodemon)

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

El servidor estará disponible en: `http://localhost:5000`

## 📡 Endpoints Disponibles

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Obtener usuario actual | Sí |
| PUT | `/api/auth/profile` | Actualizar perfil | Sí |
| PUT | `/api/auth/change-password` | Cambiar contraseña | Sí |

### Pacientes (`/api/patients`)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/patients` | Listar pacientes | Sí | Todos |
| GET | `/api/patients/:id` | Obtener paciente | Sí | Todos |
| POST | `/api/patients` | Crear paciente | Sí | admin, editor |
| PUT | `/api/patients/:id` | Actualizar paciente | Sí | admin, editor |
| DELETE | `/api/patients/:id` | Eliminar paciente | Sí | admin |

### Sesiones (`/api/sessions`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/sessions` | Listar sesiones | Sí |
| GET | `/api/sessions/:id` | Obtener sesión | Sí |
| POST | `/api/sessions` | Crear sesión | Sí |
| PUT | `/api/sessions/:id` | Actualizar sesión | Sí |

### Pagos (`/api/payments`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/payments` | Listar pagos | Sí |
| POST | `/api/payments` | Registrar pago | Sí |

### Eventos (`/api/events`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/events` | Listar eventos | Sí |
| GET | `/api/events/:id` | Obtener evento | Sí |
| POST | `/api/events` | Crear evento | Sí |
| PUT | `/api/events/:id` | Actualizar evento | Sí |
| DELETE | `/api/events/:id` | Eliminar evento | Sí |

### Admin (`/api/admin`)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/admin/stats` | Estadísticas | Sí | admin, director |
| GET | `/api/admin/reports` | Reportes | Sí | admin, director |

## 🔐 Autenticación

### Registro

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123",
  "name": "Nombre Usuario",
  "role": "usuario"
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "abc123",
      "email": "usuario@example.com",
      "name": "Nombre Usuario",
      "role": "usuario"
    }
  }
}
```

### Usar el Token

Incluye el token en el header `Authorization`:

```bash
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 👥 Roles de Usuario

- **admin**: Acceso total al sistema
- **organizador**: Puede crear y gestionar eventos
- **usuario**: Usuario regular
- **therapist**: Terapeuta (del sistema original)
- **editor**: Editor (del sistema original)
- **director**: Director con permisos especiales

## 🗂️ Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── firebase.js          # Configuración Firebase Admin
│   ├── controllers/
│   │   └── authController.js    # Lógica de autenticación
│   ├── middlewares/
│   │   ├── auth.middleware.js   # Verificación JWT
│   │   └── role.middleware.js   # Verificación de roles
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── patient.routes.js
│   │   ├── session.routes.js
│   │   ├── payment.routes.js
│   │   ├── event.routes.js
│   │   └── admin.routes.js
│   ├── utils/
│   │   ├── jwt.js               # Helpers JWT
│   │   ├── bcrypt.js            # Helpers bcrypt
│   │   └── pagination.js        # Helper paginación
│   └── app.js                   # Configuración Express
├── uploads/                     # Archivos subidos
├── .env                         # Variables de entorno
├── .gitignore
├── package.json
├── server.js                    # Entry point
└── serviceAccountKey.json       # Firebase key (no subir a Git)
```

## 🧪 Testing

### Health Check

```bash
curl http://localhost:5000/health
```

### Test de Registro

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Usuario Test",
    "role": "usuario"
  }'
```

### Test de Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

## 🔒 Seguridad

- ✅ Passwords hasheados con bcrypt (12 rounds)
- ✅ JWT con expiración configurable
- ✅ Helmet para headers de seguridad
- ✅ CORS configurado
- ✅ Validación de inputs
- ✅ Rate limiting (por implementar)

## 📝 Próximos Pasos

- [ ] Implementar controladores de pacientes
- [ ] Implementar controladores de sesiones
- [ ] Implementar controladores de pagos
- [ ] Implementar controladores de eventos
- [ ] Implementar upload de imágenes con Multer
- [ ] Implementar paginación en todos los endpoints
- [ ] Implementar búsqueda y filtrado avanzado
- [ ] Implementar panel administrativo con estadísticas
- [ ] Agregar tests unitarios
- [ ] Agregar documentación con Swagger

## 🐛 Troubleshooting

### Error: Cannot find module './serviceAccountKey.json'

Descarga el Service Account Key de Firebase Console y guárdalo en la carpeta `backend/`.

### Error: JWT_SECRET is not defined

Asegúrate de tener el archivo `.env` con la variable `JWT_SECRET` configurada.

### Error: Port 5000 already in use

Cambia el puerto en `.env` o mata el proceso que está usando el puerto 5000:

```bash
lsof -ti:5000 | xargs kill -9
```

## 📄 Licencia

ISC

## 👨‍💻 Autor

Pablo Aguilar - Proyecto Final NodeJS Avanzado
