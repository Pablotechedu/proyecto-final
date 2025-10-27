# Hub Terapias - Proyecto Final Node.js Avanzado

## 📋 Información del Proyecto

**Universidad:** Galileo  
**Curso:** Node.js Avanzado  
**Proyecto:** Sistema de Gestión de Terapias  
**Fecha:** Octubre 2025

## 🎯 Descripción

Sistema fullstack para gestión de terapias que permite administrar pacientes, sesiones terapéuticas, pagos y generar reportes estadísticos. El proyecto cumple con todos los requisitos técnicos del curso adaptados al dominio de gestión de terapias.

## 🏗️ Arquitectura del Proyecto

### Stack Tecnológico

**Frontend:**
- React 18 + TypeScript
- Material-UI (MUI) v5
- React Router v6
- Axios para HTTP requests
- Vite como build tool

**Backend:**
- Node.js + Express
- Firebase Admin SDK
- Firestore (NoSQL Database)
- JWT para autenticación
- Multer para subida de archivos
- Bcrypt para encriptación

## 📁 Estructura del Proyecto

```
hub-terapias/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.js          # Configuración Firebase
│   │   ├── controllers/
│   │   │   ├── authController.js    # Autenticación
│   │   │   ├── patientController.js # CRUD Pacientes
│   │   │   ├── sessionController.js # CRUD Sesiones
│   │   │   ├── paymentController.js # CRUD Pagos
│   │   │   └── statsController.js   # Estadísticas
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js   # Verificación JWT
│   │   │   ├── role.middleware.js   # Control de roles
│   │   │   └── upload.middleware.js # Subida de archivos
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── patient.routes.js
│   │   │   ├── session.routes.js
│   │   │   ├── payment.routes.js
│   │   │   ├── upload.routes.js
│   │   │   ├── stats.routes.js
│   │   │   ├── professional.routes.js
│   │   │   └── parentTutor.routes.js
│   │   ├── utils/
│   │   │   ├── jwt.js               # Utilidades JWT
│   │   │   ├── bcrypt.js            # Encriptación
│   │   │   └── pagination.js        # Paginación
│   │   ├── app.js                   # Configuración Express
│   │   └── server.js                # Punto de entrada
│   ├── uploads/                     # Archivos subidos
│   ├── .env                         # Variables de entorno
│   ├── serviceAccountKey.json       # Credenciales Firebase
│   └── package.json
├── src/
│   ├── components/
│   │   └── Layout.tsx               # Layout principal
│   ├── hooks/
│   │   └── useAuth.tsx              # Hook de autenticación
│   ├── pages/
│   │   ├── Dashboard.tsx            # Dashboard con estadísticas
│   │   ├── Login.tsx                # Página de login
│   │   ├── Patients.tsx             # Lista de pacientes
│   │   ├── PatientForm.tsx          # Formulario paciente
│   │   ├── Sessions.tsx             # Lista de sesiones
│   │   ├── SessionForm.tsx          # Formulario sesión
│   │   ├── Payments.tsx             # Lista de pagos
│   │   └── PaymentForm.tsx          # Formulario pago
│   ├── services/
│   │   ├── api.ts                   # Cliente Axios
│   │   ├── patients.ts              # Servicio pacientes
│   │   ├── sessions.ts              # Servicio sesiones
│   │   ├── payments.ts              # Servicio pagos
│   │   └── stats.ts                 # Servicio estadísticas
│   ├── types/
│   │   └── index.ts                 # Tipos TypeScript
│   ├── App.tsx
│   └── main.tsx
└── package.json
```

## ✅ Requisitos Técnicos Implementados

### 1. Frontend (React + TypeScript)
- ✅ Página de inicio con dashboard
- ✅ Búsqueda y filtrado avanzado
- ✅ Páginas de detalle
- ✅ Proceso de registro/gestión
- ✅ Panel de usuario
- ✅ Registro y login
- ✅ Panel administrativo con roles

### 2. Backend (API REST Node.js)
- ✅ Gestión de usuarios y roles
- ✅ CRUD completo (Pacientes, Sesiones, Pagos)
- ✅ Subida y manejo de imágenes (Multer)
- ✅ Endpoints con paginación
- ✅ Filtrado y validación de datos
- ✅ Protección de rutas con JWT
- ✅ Autorización basada en roles

### 3. Base de Datos (Firestore)
- ✅ Estructura de colecciones
- ✅ Relaciones entre documentos
- ✅ Subcolecciones (parentTutors, relatedProfessionals)
- ✅ Organización clara de datos

### 4. Panel Administrativo
- ✅ Dashboard con estadísticas
- ✅ Gestión completa de entidades
- ✅ Gestión de usuarios y roles
- ✅ Reportes básicos

### 5. Funcionalidades Clave
- ✅ Subida de imágenes
- ✅ Paginación backend y frontend
- ✅ Filtrado avanzado
- ✅ Separación de roles (admin, editor, viewer)

## 🔐 Sistema de Autenticación

### Roles Implementados
- **Admin**: Acceso total, puede eliminar registros
- **Editor**: Puede crear y editar, no puede eliminar
- **Viewer**: Solo lectura

### Flujo de Autenticación
1. Usuario ingresa credenciales
2. Backend valida con Firebase Auth
3. Genera JWT token
4. Frontend almacena token
5. Interceptor Axios agrega token a requests
6. Middleware verifica token en cada request

## 📊 Endpoints API

### Autenticación
```
POST   /api/auth/login          # Login
POST   /api/auth/register       # Registro
GET    /api/auth/me             # Usuario actual
```

### Pacientes
```
GET    /api/patients            # Listar (paginado)
GET    /api/patients/:id        # Obtener uno
POST   /api/patients            # Crear
PUT    /api/patients/:id        # Actualizar
DELETE /api/patients/:id        # Eliminar (admin)
```

### Sesiones
```
GET    /api/sessions            # Listar (paginado)
GET    /api/sessions/:id        # Obtener una
POST   /api/sessions            # Crear
PUT    /api/sessions/:id        # Actualizar
DELETE /api/sessions/:id        # Eliminar (admin)
```

### Pagos
```
GET    /api/payments            # Listar (paginado)
GET    /api/payments/:id        # Obtener uno
POST   /api/payments            # Crear
PUT    /api/payments/:id        # Actualizar
DELETE /api/payments/:id        # Eliminar (admin)
```

### Subida de Archivos
```
POST   /api/upload/image        # Subir imagen
POST   /api/upload/images       # Subir múltiples
GET    /api/upload/list         # Listar imágenes
DELETE /api/upload/:filename    # Eliminar imagen
```

### Estadísticas
```
GET    /api/stats/dashboard           # Estadísticas generales
GET    /api/stats/sessions-by-month   # Sesiones por mes
GET    /api/stats/revenue-by-month    # Ingresos por mes
GET    /api/stats/top-patients        # Top pacientes
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Cuenta de Firebase

### Backend

1. **Instalar dependencias:**
```bash
cd hub-terapias/backend
npm install
```

2. **Configurar variables de entorno (.env):**
```env
PORT=5001
NODE_ENV=development
JWT_SECRET=tu_secret_key_aqui
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

3. **Agregar credenciales de Firebase:**
- Descargar `serviceAccountKey.json` desde Firebase Console
- Colocar en `backend/serviceAccountKey.json`

4. **Iniciar servidor:**
```bash
npm run dev
```

### Frontend

1. **Instalar dependencias:**
```bash
cd hub-terapias
npm install
```

2. **Configurar variables de entorno (.env):**
```env
VITE_API_URL=http://localhost:5001/api
```

3. **Iniciar aplicación:**
```bash
npm run dev
```

## 📝 Uso del Sistema

### Credenciales de Prueba
```
Email: admin@hubterapias.com
Password: admin123
```

### Flujo de Trabajo

1. **Login**: Ingresar con credenciales
2. **Dashboard**: Ver estadísticas generales
3. **Pacientes**: Gestionar pacientes
4. **Sesiones**: Registrar sesiones de terapia
5. **Pagos**: Registrar pagos
6. **Reportes**: Ver estadísticas y reportes

## 🎨 Características Destacadas

### Paginación
- Backend: Implementada con helper de paginación
- Frontend: Componente Pagination de MUI
- Parámetros: page, limit, search, filters

### Filtrado Avanzado
- Búsqueda por texto
- Filtros por estado
- Filtros por fecha
- Combinación de múltiples filtros

### Subida de Imágenes
- Validación de tipo de archivo
- Límite de tamaño (5MB)
- Nombres únicos con timestamp
- Almacenamiento en `/uploads`

### Dashboard con Estadísticas
- Total de pacientes (activos/inactivos)
- Sesiones completadas
- Sesiones del mes
- Ingresos totales
- Ingresos del mes
- Gráficas de barras

## 🔒 Seguridad

- ✅ Autenticación JWT
- ✅ Passwords encriptados con bcrypt
- ✅ Validación de roles en rutas
- ✅ CORS configurado
- ✅ Helmet para headers de seguridad
- ✅ Validación de datos en backend

## 📦 Dependencias Principales

### Backend
```json
{
  "express": "^4.18.2",
  "firebase-admin": "^12.0.0",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "multer": "^1.4.5-lts.1",
  "cors": "^2.8.5",
  "helmet": "^7.1.0"
}
```

### Frontend
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "@mui/material": "^5.15.0",
  "axios": "^1.6.2",
  "typescript": "^5.3.3"
}
```

## 🧪 Testing

### Probar API con curl

**Login:**
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hubterapias.com","password":"admin123"}'
```

**Obtener pacientes:**
```bash
curl http://localhost:5001/api/patients?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📈 Mejoras Futuras

- [ ] Gráficas interactivas (Chart.js/Recharts)
- [ ] Exportar reportes a PDF
- [ ] Notificaciones en tiempo real
- [ ] Chat entre terapeuta y paciente
- [ ] Integración con calendario
- [ ] App móvil (React Native)

## 👥 Autor

**Pablo Aguilar**  
Universidad Galileo - Node.js Avanzado  
Octubre 2025

## 📄 Licencia

Este proyecto es parte de un trabajo académico para la Universidad Galileo.
