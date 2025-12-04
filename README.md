# Hub Terapias - Sistema de Gestión de Terapias

Sistema completo de gestión para centros de terapia, desarrollado con stack MERN (MongoDB, Express, React, Node.js).

Link de video con explicacion del proyecto: https://drive.google.com/file/d/1Nd0Nsa-yaCkTOTT3IRPuLuT97aJPv7Qd/view?usp=drive_link

##  Características Principales

-  **Gestión de Pacientes**: CRUD completo con búsqueda y filtros
-  **Gestión de Sesiones**: Programación y seguimiento de sesiones terapéuticas
-  **Gestión de Pagos**: Control financiero con reportes
-  **Dashboard Administrativo**: Estadísticas en tiempo real
-  **Sistema de Usuarios**: Roles y permisos (Admin, Editor, Viewer, Director)
-  **Autenticación JWT**: Sistema seguro de autenticación
-  **Subida de Imágenes**: Gestión de archivos con Multer
-  **Responsive Design**: Interfaz adaptable a todos los dispositivos

##  Stack Tecnológico

### Frontend
- **React 18** con TypeScript
- **Material-UI (MUI)** para componentes
- **React Router** para navegación
- **Vite** como build tool
- **Axios** para peticiones HTTP

### Backend
- **Node.js** con Express
- **Firebase Admin SDK** para autenticación
- **Firestore** como base de datos
- **JWT** para tokens de sesión
- **Multer** para subida de archivos
- **Bcrypt** para encriptación


##  Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd hub-terapias
```

### 2. Configurar el Frontend

```bash
# Instalar dependencias
npm install

# Crear archivo .env en la raíz
cp .env.example .env
```

Editar `.env` con tus credenciales de Firebase:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_API_URL=http://localhost:5000/api
```

### 3. Configurar el Backend

```bash
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env
```

Editar `backend/.env`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=tu_secret_key_super_seguro
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### 4. Configurar Firebase Admin SDK

1. Ve a Firebase Console → Project Settings → Service Accounts
2. Genera una nueva clave privada
3. Guarda el archivo como `backend/serviceAccountKey.json`


##  Ejecución

### Desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Producción

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
npm run build
npm run preview
```

## 📁 Estructura del Proyecto

```
hub-terapias/
├── backend/                    # Backend Node.js
│   ├── src/
│   │   ├── config/            # Configuración (Firebase, etc)
│   │   ├── controllers/       # Controladores de rutas
│   │   ├── middlewares/       # Middlewares (auth, roles, upload)
│   │   ├── routes/            # Definición de rutas
│   │   ├── utils/             # Utilidades (JWT, bcrypt, pagination)
│   │   └── app.js            # Configuración de Express
│   ├── uploads/              # Archivos subidos
│   ├── .env                  # Variables de entorno
│   ├── server.js             # Punto de entrada
│   └── package.json
│
├── src/                       # Frontend React
│   ├── components/           # Componentes reutilizables
│   ├── hooks/                # Custom hooks
│   ├── pages/                # Páginas de la aplicación
│   ├── services/             # Servicios API
│   ├── types/                # Tipos TypeScript
│   ├── App.tsx               # Componente principal
│   └── main.tsx              # Punto de entrada
│
├── .env                      # Variables de entorno frontend
├── package.json
└── README.md
```

## 🔐 Sistema de Roles

### Roles Disponibles

1. **Admin**: Acceso total al sistema
   - Gestión de usuarios
   - Todas las funcionalidades

2. **Editor**: Puede crear y editar
   - Gestión de pacientes
   - Gestión de sesiones
   - Gestión de pagos

3. **Viewer**: Solo lectura
   - Ver pacientes
   - Ver sesiones
   - Ver pagos

4. **Director**: Acceso especial
   - Todas las funcionalidades de Admin
   - Acceso a "Mi Hub" (vista de terapeuta)

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/me` - Obtener usuario actual

### Usuarios (Admin only)
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Pacientes
- `GET /api/patients` - Listar pacientes
- `GET /api/patients/:id` - Obtener paciente
- `POST /api/patients` - Crear paciente
- `PUT /api/patients/:id` - Actualizar paciente
- `DELETE /api/patients/:id` - Eliminar paciente

### Sesiones
- `GET /api/sessions` - Listar sesiones
- `GET /api/sessions/:id` - Obtener sesión
- `POST /api/sessions` - Crear sesión
- `PUT /api/sessions/:id` - Actualizar sesión
- `DELETE /api/sessions/:id` - Eliminar sesión

### Pagos
- `GET /api/payments` - Listar pagos
- `GET /api/payments/:id` - Obtener pago
- `POST /api/payments` - Crear pago
- `PUT /api/payments/:id` - Actualizar pago
- `DELETE /api/payments/:id` - Eliminar pago

### Estadísticas
- `GET /api/stats/dashboard` - Estadísticas del dashboard

Ver documentación completa en `backend/TEST_API.md`

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
npm test
```

## 👥 Autores

- **Pablo Aguilar** - Desarrollo Full Stack
