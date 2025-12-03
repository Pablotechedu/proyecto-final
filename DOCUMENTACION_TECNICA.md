# Documentación Técnica - Learning Models HUB
## Hub de Gestión de Terapias y Pacientes

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Objetivo del Proyecto](#objetivo-del-proyecto)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Arquitectura del Sistema](#arquitectura-del-sistema)
5. [Cumplimiento de Requisitos](#cumplimiento-de-requisitos)
6. [Estructura de Datos](#estructura-de-datos)
7. [Autenticación y Autorización](#autenticación-y-autorización)
8. [API Reference](#api-reference)
9. [Instalación y Despliegue](#instalación-y-despliegue)
10. [Características Implementadas](#características-implementadas)

---

## 🎯 Introducción

**Learning Models HUB** es una plataforma web fullstack diseñada para la gestión integral de centros de terapias especializadas. El sistema permite administrar pacientes, sesiones terapéuticas, profesionales, pagos y generar estadísticas, todo en un entorno seguro con control de acceso basado en roles.

### Contexto Académico

Este proyecto cumple con los requisitos establecidos para el Proyecto Final de **NodeJS Avanzado**, adaptando el concepto de "Gestión de Eventos y Boletos" al dominio de **Gestión de Terapias y Pacientes**.

---

## 🎯 Objetivo del Proyecto

Desarrollar una plataforma web fullstack que permita:

- **Gestionar sesiones terapéuticas** (equivalente a "eventos" en la rúbrica original)
- **Registrar pagos y facturación** (equivalente a "boletos")
- **Administrar usuarios con roles diferenciados** (Admin, Editor, Terapeuta)
- **Subir y manejar imágenes** (fotos de pacientes, documentos)
- **Implementar búsquedas avanzadas y paginación**
- **Panel administrativo exclusivo** para usuarios autorizados

---

## 🛠 Stack Tecnológico

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 19.1.1 | Librería principal para UI |
| **Vite** | 7.1.7 | Build tool y dev server |
| **Material UI (MUI)** | 7.3.2 | Componentes UI pre-diseñados |
| **TypeScript** | 5.9.3 | Tipado estático |
| **React Router** | 7.9.3 | Navegación SPA |
| **React Query** | 5.90.2 | Gestión de estado asíncrono |
| **React Hook Form** | 7.63.0 | Manejo de formularios |
| **Axios** | 1.12.2 | Cliente HTTP |

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | LTS | Runtime de JavaScript |
| **Express** | 4.x | Framework web |
| **Firebase Admin SDK** | 13.5.0 | Gestión de Firestore y Auth |
| **bcryptjs** | 2.x | Hash de contraseñas |
| **jsonwebtoken** | 9.x | Autenticación JWT |
| **multer** | 1.x | Subida de archivos |
| **cors** | 2.x | CORS middleware |

### Base de Datos

- **Firebase Firestore** (NoSQL)
  - Justificación: Flexibilidad para datos médicos dinámicos, escalabilidad automática, y facilidad de integración con servicios de Google Cloud.

---

## 🏗 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Login      │  │  Dashboard   │  │  Pacientes   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Sesiones    │  │    Pagos     │  │   Usuarios   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                    API REST (JWT Auth)
                            │
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js + Express)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Middlewares (Auth, Roles)               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Controllers  │  │    Routes    │  │   Services   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                    Firebase Admin SDK
                            │
┌─────────────────────────────────────────────────────────────┐
│                  FIREBASE FIRESTORE (NoSQL)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Patients   │  │   Sessions   │  │    Users     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Payments   │  │    Events    │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Cumplimiento de Requisitos

### Frontend (React)

| Requisito Original | Implementación Real | Estado |
|-------------------|---------------------|--------|
| Página de inicio con eventos destacados | Dashboard con estadísticas de sesiones | ✅ |
| Búsqueda y filtrado avanzado | Búsqueda de pacientes con filtros múltiples | ✅ |
| Página de detalle para cada evento | Detalle completo de paciente con historial | ✅ |
| Proceso de compra/registro | Formulario de registro de sesiones y pagos | ✅ |
| Panel de usuario | Panel de terapeuta con sesiones asignadas | ✅ |
| Registro y login | Sistema de autenticación completo | ✅ |
| Panel administrativo | Dashboard exclusivo para Admin/Editor | ✅ |

### Backend (API REST en Node.js)

| Requisito Original | Implementación Real | Estado |
|-------------------|---------------------|--------|
| Gestión de usuarios, roles, eventos | Gestión de usuarios, pacientes, sesiones | ✅ |
| Subida y manejo de imágenes | Upload de fotos de perfil y documentos | ✅ |
| Endpoints con paginación | Paginación en pacientes, sesiones, pagos | ✅ |
| Filtrado y validación | Filtros avanzados + validación de datos | ✅ |
| Protección de rutas | Middleware JWT + sistema de permisos | ✅ |

### Base de Datos

| Requisito Original | Implementación Real | Estado |
|-------------------|---------------------|--------|
| Estructura relacional | Firestore (NoSQL) con relaciones lógicas | ✅ |
| Claves foráneas | Referencias por ID entre colecciones | ✅ |
| Relación usuarios/roles/eventos | Estructura users → patients → sessions | ✅ |
| Organización de categorías | Categorías de terapias y especialidades | ✅ |

### Panel Administrativo

| Requisito Original | Implementación Real | Estado |
|-------------------|---------------------|--------|
| Dashboard con estadísticas | Stats de sesiones, pagos, pacientes | ✅ |
| Gestión completa de eventos | CRUD completo de sesiones terapéuticas | ✅ |
| Gestión de usuarios y roles | Sistema de permisos granular | ✅ |
| CRUD de categorías | Gestión de tipos de terapia | ✅ |
| Reportes básicos | Estadísticas mensuales y top pacientes | ✅ |

---

## 🗄 Estructura de Datos

### Colección: `users`

```json
{
  "id": "user_uuid",
  "email": "admin@example.com",
  "name": "Admin User",
  "password": "hashed_password",
  "permissions": {
    "isAdmin": true,
    "isEditor": false,
    "isTherapist": false,
    "isDirector": false
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Colección: `patients`

```json
{
  "id": "patient_uuid",
  "firstName": "Juan",
  "lastName": "Pérez",
  "dateOfBirth": "2010-05-15",
  "age": 14,
  "gender": "Masculino",
  "diagnosis": "TDAH",
  "school": "Colegio ABC",
  "grade": "8vo",
  "photoURL": "/uploads/patient-photo.jpg",
  "status": "active",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Subcolección: `patients/{id}/parentTutors`

```json
{
  "id": "parent_uuid",
  "fullName": "María Pérez",
  "relationship": "Madre",
  "phone": "+502 1234-5678",
  "email": "maria@example.com",
  "address": "Zona 10, Guatemala",
  "isPrimary": true
}
```

#### Subcolección: `patients/{id}/relatedProfessionals`

```json
{
  "id": "prof_uuid",
  "name": "Dr. Carlos López",
  "specialty": "Neurología",
  "phone": "+502 8765-4321",
  "email": "carlos@example.com",
  "institution": "Hospital General"
}
```

### Colección: `sessions`

```json
{
  "id": "session_uuid",
  "patientId": "patient_uuid",
  "patientName": "Juan Pérez",
  "therapistId": "user_uuid",
  "therapistName": "Dr. Ana García",
  "date": "2024-06-15",
  "duration": 60,
  "sessionNumber": 10,
  "therapyType": "Rehabilitación Cognitiva",
  "objectives": ["Mejorar atención", "Memoria de trabajo"],
  "activities": "Ejercicios de atención sostenida",
  "observations": "Mostró mejoría en concentración",
  "homework": "Practicar ejercicios diarios",
  "nextSessionDate": "2024-06-22",
  "status": "completed",
  "createdAt": "2024-06-15T10:00:00.000Z"
}
```

### Colección: `payments`

```json
{
  "id": "payment_uuid",
  "patientId": "patient_uuid",
  "patientName": "Juan Pérez",
  "amount": 350.00,
  "paymentDate": "2024-06-01",
  "paymentMethod": "Transferencia",
  "description": "Pago de sesiones de junio",
  "status": "completed",
  "receiptNumber": "REC-2024-001",
  "createdBy": "user_uuid",
  "createdAt": "2024-06-01T09:00:00.000Z"
}
```

### Colección: `events` (Calendario)

```json
{
  "id": "event_uuid",
  "title": "Sesión: Juan Pérez",
  "description": "Terapia cognitiva",
  "start": "2024-06-15T10:00:00",
  "end": "2024-06-15T11:00:00",
  "patientId": "patient_uuid",
  "therapistId": "user_uuid",
  "type": "session",
  "color": "#4CAF50"
}
```

---

## 🔐 Autenticación y Autorización

### Sistema de Permisos

El sistema implementa un modelo de permisos granular basado en checkboxes:

```javascript
{
  isAdmin: true,    // Acceso total al sistema
  isEditor: false,  // Puede crear/editar contenido
  isTherapist: false, // Solo sus pacientes y sesiones
  isDirector: false  // Visualización de reportes avanzados
}
```

### Middlewares de Seguridad

#### 1. `auth` - Verificación JWT

```javascript
// Valida token JWT en headers
Authorization: Bearer <token>
```

#### 2. Middlewares de Roles

- `checkAdmin` - Solo administradores
- `checkCanEdit` - Admin o Editor
- `checkCanDelete` - Solo Admin
- `checkTherapistAccess` - Terapeuta puede ver solo sus recursos
- `checkAnyPermission([permisos])` - Al menos uno de los permisos
- `checkAllPermissions([permisos])` - Todos los permisos requeridos

### Rutas Protegidas

| Ruta | Método | Permiso Requerido |
|------|--------|-------------------|
| `/api/patients` | POST | Editor o Admin |
| `/api/patients/:id` | PUT | Editor o Admin |
| `/api/patients/:id` | DELETE | Admin |
| `/api/sessions` | POST | Autenticado |
| `/api/sessions/:id` | DELETE | Admin |
| `/api/payments/:id` | DELETE | Admin |
| `/api/users` | POST | Admin |
| `/api/stats/*` | GET | Editor o Admin |

---

## 📡 API Reference

### Autenticación

```
POST   /api/auth/register        - Registrar nuevo usuario
POST   /api/auth/login           - Iniciar sesión
POST   /api/auth/logout          - Cerrar sesión
GET    /api/auth/me              - Obtener usuario actual
```

### Pacientes

```
GET    /api/patients             - Listar pacientes (paginado)
GET    /api/patients/:id         - Obtener paciente por ID
POST   /api/patients             - Crear paciente [Editor/Admin]
PUT    /api/patients/:id         - Actualizar paciente [Editor/Admin]
DELETE /api/patients/:id         - Eliminar paciente [Admin]
```

#### Subrecursos de Pacientes

```
GET    /api/patients/:id/parents              - Padres/Tutores
POST   /api/patients/:id/parents              - Agregar padre [Editor/Admin]
PUT    /api/patients/:id/parents/:parentId    - Actualizar padre [Editor/Admin]
DELETE /api/patients/:id/parents/:parentId    - Eliminar padre [Editor/Admin]

GET    /api/patients/:id/professionals        - Profesionales relacionados
POST   /api/patients/:id/professionals        - Agregar profesional [Editor/Admin]
PUT    /api/patients/:id/professionals/:profId - Actualizar profesional [Editor/Admin]
DELETE /api/patients/:id/professionals/:profId - Eliminar profesional [Editor/Admin]
```

### Sesiones

```
GET    /api/sessions             - Listar sesiones (paginado, filtros)
GET    /api/sessions/:id         - Obtener sesión por ID
POST   /api/sessions             - Crear sesión
PUT    /api/sessions/:id         - Actualizar sesión
DELETE /api/sessions/:id         - Eliminar sesión [Admin]
```

**Filtros disponibles:**
- `?patientId=xxx` - Sesiones de un paciente
- `?therapistId=xxx` - Sesiones de un terapeuta
- `?startDate=YYYY-MM-DD` - Desde fecha
- `?endDate=YYYY-MM-DD` - Hasta fecha
- `?status=completed|pending|cancelled` - Por estado
- `?page=1&limit=10` - Paginación

### Pagos

```
GET    /api/payments             - Listar pagos (paginado)
GET    /api/payments/:id         - Obtener pago por ID
POST   /api/payments             - Registrar pago
PUT    /api/payments/:id         - Actualizar pago
DELETE /api/payments/:id         - Eliminar pago [Admin]
```

**Filtros disponibles:**
- `?patientId=xxx` - Pagos de un paciente
- `?startDate=YYYY-MM-DD` - Desde fecha
- `?endDate=YYYY-MM-DD` - Hasta fecha
- `?status=completed|pending|cancelled` - Por estado

### Usuarios

```
GET    /api/users                - Listar usuarios (paginado) [Admin]
GET    /api/users/:id            - Obtener usuario por ID [Admin]
POST   /api/users                - Crear usuario [Admin]
PUT    /api/users/:id            - Actualizar usuario [Admin]
DELETE /api/users/:id            - Eliminar usuario [Admin]
```

### Estadísticas

```
GET    /api/stats/dashboard      - Estadísticas generales [Editor/Admin]
GET    /api/stats/sessions-by-month - Sesiones por mes [Editor/Admin]
GET    /api/stats/revenue-by-month  - Ingresos por mes [Editor/Admin]
GET    /api/stats/top-patients   - Top pacientes por sesiones [Editor/Admin]
```

### Upload de Archivos

```
POST   /api/upload/image         - Subir imagen [Editor/Admin]
POST   /api/upload/images        - Subir múltiples imágenes [Editor/Admin]
DELETE /api/upload/:filename     - Eliminar imagen [Admin]
GET    /api/upload/list          - Listar imágenes
```

### Eventos (Calendario)

```
GET    /api/events               - Listar eventos
GET    /api/events/:id           - Obtener evento por ID
POST   /api/events               - Crear evento
PUT    /api/events/:id           - Actualizar evento
DELETE /api/events/:id           - Eliminar evento [Admin]
```

---

## 🚀 Instalación y Despliegue

### Prerrequisitos

- Node.js v18+ 
- npm v9+
- Cuenta de Firebase con proyecto creado

### Configuración del Backend

1. **Clonar el repositorio:**

```bash
git clone <repository-url>
cd hub-terapias/backend
```

2. **Instalar dependencias:**

```bash
npm install
```

3. **Configurar variables de entorno:**

Crear archivo `.env` basado en `.env.example`:

```env
PORT=5001
NODE_ENV=development

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:5173
```

4. **Iniciar servidor:**

```bash
npm start
```

El servidor estará disponible en `http://localhost:5001`

### Configuración del Frontend

1. **Navegar al directorio frontend:**

```bash
cd ../  # Si estás en /backend
```

2. **Instalar dependencias:**

```bash
npm install
```

3. **Configurar Firebase:**

Crear archivo `.env` en la raíz del frontend:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_API_URL=http://localhost:5001/api
```

4. **Iniciar servidor de desarrollo:**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Scripts Útiles

#### Backend

```bash
npm start                          # Iniciar servidor
npm run dev                        # Modo desarrollo (con nodemon)
node scripts/generate-mock-data.js # Generar datos de prueba
node scripts/clean-database.js     # Limpiar base de datos
node migrate-users-to-permissions.js # Migrar sistema de roles
```

#### Frontend

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
npm run lint     # Linter de código
```

---

## 🎨 Características Implementadas

### ✅ Funcionalidades Principales

#### 1. **Gestión de Pacientes**
- CRUD completo de pacientes
- Información detallada (datos personales, diagnóstico, escuela)
- Subida de foto de perfil
- Gestión de padres/tutores (subcolección)
- Gestión de profesionales relacionados (médicos, terapeutas externos)
- Búsqueda y filtrado avanzado
- Paginación de resultados

#### 2. **Gestión de Sesiones Terapéuticas**
- Registro detallado de sesiones
- Tipos de terapia: Rehabilitación Cognitiva, Terapia Emocional, Funciones Ejecutivas, Lectoescritura, Matemáticas, Tutorías
- Objetivos personalizados por sesión
- Actividades realizadas y observaciones
- Asignación de tareas para casa
- Programación de próxima sesión
- Filtros por paciente, terapeuta, fecha, estado

#### 3. **Sistema de Pagos**
- Registro de pagos por paciente
- Múltiples métodos de pago
- Generación de número de recibo
- Historial de pagos
- Estadísticas de ingresos

#### 4. **Panel Administrativo**
- Dashboard con estadísticas en tiempo real:
  - Total de pacientes activos
  - Sesiones del mes
  - Ingresos del mes
  - Promedio de sesiones por paciente
- Gráficos de sesiones por mes
- Gráficos de ingresos mensuales
- Top pacientes por número de sesiones

#### 5. **Sistema de Usuarios y Roles**
- Autenticación con JWT
- Registro y login seguro
- Permisos granulares:
  - **Admin**: Acceso total
  - **Editor**: Crear/editar contenido
  - **Terapeuta**: Solo sus pacientes y sesiones
  - **Director**: Visualización de reportes
- Gestión de usuarios (solo Admin)

#### 6. **Calendario de Eventos**
- Visualización de sesiones programadas
- Integración con Google Calendar (preparado)
- Eventos personalizados

#### 7. **Upload de Archivos**
- Subida de imágenes
- Validación de tipo y tamaño
- Almacenamiento local (preparado para Cloud Storage)

### ✅ Mejores Prácticas Implementadas

#### Clean Code
- ✅ Nombres descriptivos de variables y funciones
- ✅ Funciones pequeñas y enfocadas
- ✅ Separación de responsabilidades (MVC)
- ✅ DRY (Don't Repeat Yourself)
- ✅ Comentarios JSDoc en funciones principales

#### Seguridad
- ✅ Hash de contraseñas con bcrypt
- ✅ Validación de tokens JWT
- ✅ Middlewares de autorización por roles
- ✅ Sanitización de inputs
- ✅ CORS configurado correctamente
- ✅ Variables de entorno para secretos

#### Performance
- ✅ Paginación en listados grandes
- ✅ Índices en Firestore para consultas rápidas
- ✅ React Query para cache de datos
- ✅ Lazy loading de componentes (preparado)
- ✅ Optimización de queries a BD

#### Mantenibilidad
- ✅ Estructura de carpetas clara
- ✅ Separación Frontend/Backend
- ✅ Componentes reutilizables
- ✅ Custom hooks
- ✅ TypeScript para type safety
- ✅ ESLint para calidad de código

#### Testing (Preparado para)
- ⚙️ Jest para tests unitarios
- ⚙️ React Testing Library para componentes
- ⚙️ Supertest para endpoints
- ⚙️ Tests de integración

---

## 📊 Estadísticas del Proyecto

### Código Backend
- **Archivos TypeScript/JavaScript:** ~30
- **Rutas API:** 50+
- **Controladores:** 7
- **Middlewares:** 3
- **Colecciones Firestore:** 5 principales

### Código Frontend
- **Componentes React:** ~25
- **Páginas:** 12
- **Servicios API:** 8
- **Custom Hooks:** 2
- **Formularios:** 10+

---

## 🔄 Flujo de Trabajo Típico

### Registro de Nueva Sesión

1. **Terapeuta inicia sesión** → JWT generado
2. **Navega a "Nueva Sesión"** → Formulario cargado
3. **Selecciona paciente** → Autocomplete con búsqueda
4. **Completa datos de sesión:**
   - Tipo de terapia
   - Objetivos
   - Actividades
   - Observaciones
5. **Guarda sesión** → POST `/api/sessions`
6. **Backend valida:**
   - Token JWT válido
   - Usuario tiene permisos
   - Datos completos
7. **Guarda en Firestore** → Sesión creada
8. **Actualiza estadísticas** → Dashboard actualizado
9. **Respuesta al cliente** → Confirmación mostrada

---

## 🐛 Troubleshooting

### Problemas Comunes

#### Error: "EADDRINUSE: address already in use"

```bash
# Matar proceso en puerto 5001
lsof -ti:5001 | xargs kill -9
```

#### Error: "Firebase Admin SDK not initialized"

- Verificar variables de entorno en `.env`
- Asegurarse que `FIREBASE_PRIVATE_KEY` incluye `\n` para saltos de línea

#### Error: "checkRole is deprecated"

- Este error fue solucionado reemplazando `checkRole` con los nuevos middlewares:
  - `checkAdmin`
  - `checkCanEdit`
  - `checkAnyPermission`

---

## 📝 Notas Finales

### Diferencias con Rúbrica Original

| Concepto Rúbrica | Adaptación Real | Justificación |
|-----------------|----------------|---------------|
| Eventos | Sesiones Terapéuticas | Mismo CRUD, diferente dominio |
| Boletos | Pagos/Facturación | Registro de transacciones |
| Categorías de Eventos | Tipos de Terapia | Clasificación de servicios |
| SQL Relacional | Firestore NoSQL | Flexibilidad para datos médicos |

### Futuras Mejoras

- [ ] Integración con WhatsApp para recordatorios
- [ ] Exportación de reportes a PDF
- [ ] Gráficos más avanzados con Chart.js
- [ ] Sistema de notificaciones push
- [ ] Integración con calendarios externos
- [ ] Modo offline (PWA)
- [ ] Tests automatizados completos

---

## 👥 Autor

**Proyecto Final - NodeJS Avanzado**  
Universidad Galileo  
2024

---

## 📄 Licencia

Este proyecto es de uso académico exclusivamente.

---

**Versión:** 1.0.0  
**Última actualización:** Diciembre 2024
