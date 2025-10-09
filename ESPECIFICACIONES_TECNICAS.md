# Especificaciones Técnicas - Learning Models HUB
## Arquitectura y Stack Tecnológico

**Versión:** 1.0  
**Fecha:** Octubre 2025  
**Arquitecto:** Sistema Learning Models

---

## 📋 Tabla de Contenidos

1. [Stack Tecnológico](#stack-tecnológico)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Base de Datos](#base-de-datos)
4. [APIs e Integraciones](#apis-e-integraciones)
5. [Seguridad](#seguridad)
6. [Deployment](#deployment)
7. [Monitoreo y Logs](#monitoreo-y-logs)

---

## 🛠️ Stack Tecnológico

### Frontend

#### **Framework Principal**
```json
{
  "framework": "React 18.2.0",
  "language": "TypeScript 5.0+",
  "buildTool": "Vite 4.4.0",
  "packageManager": "npm 9+"
}
```

#### **Librerías UI**
```json
{
  "uiFramework": "@mui/material 5.14.0",
  "icons": "@mui/icons-material 5.14.0",
  "routing": "react-router-dom 6.15.0",
  "forms": "react-hook-form 7.45.0",
  "validation": "yup 1.2.0"
}
```

#### **Estado y Data Fetching**
```json
{
  "stateManagement": "React Context API",
  "dataFetching": "Firebase SDK 10.3.0",
  "caching": "Built-in Firestore cache"
}
```

#### **Utilidades**
```json
{
  "dateHandling": "date-fns 2.30.0",
  "charts": "recharts 2.8.0",
  "notifications": "@mui/material Snackbar"
}
```

---

### Backend

#### **Plataforma**
```json
{
  "platform": "Firebase / Google Cloud Platform",
  "runtime": "Node.js 18 LTS",
  "language": "TypeScript 5.0+",
  "framework": "Express.js 4.18.0 (Cloud Functions)"
}
```

#### **Servicios Firebase**
```json
{
  "authentication": "Firebase Authentication",
  "database": "Cloud Firestore (Native Mode)",
  "functions": "Cloud Functions (2nd Gen)",
  "hosting": "Firebase Hosting",
  "storage": "Google Drive (via API)"
}
```

#### **Librerías Backend**
```json
{
  "firebaseAdmin": "firebase-admin 12.0.0",
  "firebaseFunctions": "firebase-functions 4.5.0",
  "googleApis": "googleapis 128.0.0",
  "cors": "cors 2.8.5"
}
```

---

## 🏗️ Arquitectura del Sistema

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Components  │  Pages  │  Services  │  Hooks     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              FIREBASE SERVICES (Backend)                │
│  ┌──────────────┬──────────────┬──────────────────┐    │
│  │ Auth         │ Firestore    │ Cloud Functions  │    │
│  └──────────────┴──────────────┴──────────────────┘    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              EXTERNAL INTEGRATIONS                      │
│  ┌──────────────┬──────────────┬──────────────────┐    │
│  │ Google       │ Google       │ Google Gemini    │    │
│  │ Calendar API │ Drive API    │ (Future)         │    │
│  └──────────────┴──────────────┴──────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Flujo de Datos

#### **1. Autenticación**
```
Usuario → Firebase Auth → Token JWT → Firestore Rules
```

#### **2. Lectura de Datos**
```
Component → Service → Firestore SDK → Cache/Server → Component
```

#### **3. Escritura de Datos**
```
Form → Validation → Service → Firestore SDK → Server → Confirmation
```

#### **4. Sincronización Calendar**
```
Cloud Scheduler → Cloud Function → Google Calendar API → Firestore
```

---

## 🗄️ Base de Datos

### Firestore - Modelo de Datos

#### **Colección: `users`**
```typescript
interface User {
  // Document ID = Firebase Auth UID
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'therapist';
  isDirector?: boolean;
  googleCalendarId?: string;
  phone?: string;
  startDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Índices:
// - email (ASC)
// - role (ASC)
```

#### **Colección: `patients`**
```typescript
interface Patient {
  // Document ID = Auto-generated
  firstName: string;
  lastName: string;
  patientCode: string; // "Nombre_Apellido01"
  dateOfBirth: Timestamp;
  grade: string;
  school: string;
  diagnosis: string;
  currentRate: number;
  rateHistory: RateHistory[];
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

interface RateHistory {
  rate: number;
  startDate: Timestamp;
  endDate?: Timestamp;
}

// Índices:
// - patientCode (ASC) - UNIQUE
// - lastName (ASC), firstName (ASC)
// - school (ASC)

// Subcolecciones:
// - parentTutors
// - relatedProfessionals
```

#### **Subcolección: `patients/{id}/parentTutors`**
```typescript
interface ParentTutor {
  name: string;
  email: string;
  phone: string;
  relationship: 'Madre' | 'Padre' | 'Tutor' | 'Otro';
  isPrimary: boolean;
  createdAt: Timestamp;
}
```

#### **Subcolección: `patients/{id}/relatedProfessionals`**
```typescript
interface RelatedProfessional {
  name: string;
  specialty: string;
  contact: string;
  notes?: string;
  createdAt: Timestamp;
}
```

#### **Colección: `sessions`**
```typescript
interface Session {
  // Document ID = "gcal_[eventId]" o auto-generated
  patientId: string; // Reference to patient
  therapistId: string; // Reference to user
  startTime: Timestamp;
  endTime: Timestamp;
  duration: number; // horas
  title?: string;
  location?: string;
  source: 'google_calendar' | 'manual';
  calendarId?: string;
  googleEventId?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'NoShow';
  formCompleted: boolean;
  formData?: SessionFormData;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Índices Compuestos:
// - therapistId (ASC), startTime (DESC)
// - patientId (ASC), startTime (DESC)
// - status (ASC), startTime (DESC)
// - formCompleted (ASC), startTime (DESC)
```

#### **Colección: `payments`**
```typescript
interface Payment {
  patientId: string;
  amount: number;
  paymentDate: Timestamp;
  paymentMethod: 'Transferencia' | 'Efectivo' | 'Cheque' | 'Tarjeta';
  driveLink?: string; // Link a boleta en Google Drive
  month: string; // "Octubre 2025"
  type: 'Terapia' | 'Evaluacion' | 'Otro';
  installments?: Installment[];
  notes?: string;
  createdBy: string; // User ID
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

interface Installment {
  number: number;
  amount: number;
  dueDate: Timestamp;
  paid: boolean;
  paidDate?: Timestamp;
}

// Índices Compuestos:
// - patientId (ASC), paymentDate (DESC)
// - month (ASC), type (ASC)
// - paymentDate (DESC)
```

#### **Colección: `expenses`**
```typescript
interface Expense {
  category: 'Planilla' | 'Alquiler' | 'Servicios' | 'Materiales' | 'Otro';
  amount: number;
  date: Timestamp;
  description: string;
  receiptLink?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Índices:
// - date (DESC)
// - category (ASC), date (DESC)
```

#### **Colección: `payrolls`**
```typescript
interface Payroll {
  therapistId: string;
  month: string; // "Octubre 2025"
  hoursWorked: number;
  hourlyRate: number;
  totalAmount: number;
  bonuses?: number;
  deductions?: number;
  netAmount: number;
  status: 'Draft' | 'Approved' | 'Paid';
  paidDate?: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Índices Compuestos:
// - therapistId (ASC), month (DESC)
// - month (DESC), status (ASC)
```

---

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper Functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function isAdmin() {
      return isAuthenticated() && getUserData().role == 'admin';
    }
    
    function isDirector() {
      return isAuthenticated() && getUserData().isDirector == true;
    }
    
    function isEditor() {
      return isAuthenticated() && getUserData().role == 'editor';
    }
    
    function isTherapist() {
      return isAuthenticated() && getUserData().role == 'therapist';
    }
    
    // Users Collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Patients Collection
    match /patients/{patientId} {
      allow read: if isAuthenticated();
      allow create: if isAdmin() || isEditor();
      allow update: if isAdmin() || isEditor();
      allow delete: if isAdmin();
      
      // Subcollections
      match /parentTutors/{tutorId} {
        allow read: if isAuthenticated();
        allow write: if isAdmin() || isEditor();
      }
      
      match /relatedProfessionals/{professionalId} {
        allow read: if isAuthenticated();
        allow write: if isAdmin() || isEditor();
      }
    }
    
    // Sessions Collection
    match /sessions/{sessionId} {
      allow read: if isAuthenticated() && (
        isAdmin() || 
        isEditor() || 
        resource.data.therapistId == request.auth.uid
      );
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && (
        isAdmin() || 
        resource.data.therapistId == request.auth.uid
      );
      allow delete: if isAdmin();
    }
    
    // Payments Collection
    match /payments/{paymentId} {
      allow read: if isAuthenticated() && (isAdmin() || isEditor());
      allow write: if isAdmin() || isEditor();
    }
    
    // Expenses Collection
    match /expenses/{expenseId} {
      allow read: if isDirector();
      allow write: if isDirector();
    }
    
    // Payrolls Collection
    match /payrolls/{payrollId} {
      allow read: if isDirector() || 
        (isTherapist() && resource.data.therapistId == request.auth.uid);
      allow write: if isDirector();
    }
  }
}
```

---

## 🔌 APIs e Integraciones

### 1. Google Calendar API

#### **Configuración**
```typescript
// Service Account
{
  "type": "service_account",
  "project_id": "learning-models-hub",
  "client_email": "calendar-sync@learning-models-hub.iam.gserviceaccount.com",
  "client_id": "...",
  "scopes": [
    "https://www.googleapis.com/auth/calendar.readonly"
  ]
}

// Domain-Wide Delegation
{
  "subject": "monica@learningmodels.com.gt",
  "delegatedScopes": [
    "https://www.googleapis.com/auth/calendar.readonly"
  ]
}
```

#### **Endpoints Utilizados**
```typescript
// Listar eventos
GET https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events
Parameters:
  - timeMin: ISO 8601
  - timeMax: ISO 8601
  - singleEvents: true
  - orderBy: startTime
```

#### **Sincronización**
```typescript
// Cloud Function: syncCalendarEvents
// Trigger: HTTP Request o Cloud Scheduler
// Frecuencia: 12:30 PM y 9:00 PM (L-V)

async function syncCalendarEvents() {
  const calendars = [
    'monica@learningmodels.com.gt',
    'ximena@learningmodels.com.gt',
    'miranda@learningmodels.com.gt',
    'fernanda@learningmodels.com.gt',
    'mariajimena@learningmodels.com.gt'
  ];
  
  for (const calendarId of calendars) {
    const events = await calendar.events.list({
      calendarId,
      timeMin: startOfDay,
      timeMax: endOfDay
    });
    
    for (const event of events.data.items) {
      const patientCode = extractPatientCode(event.description);
      const patient = await findPatientByCode(patientCode);
      
      if (patient) {
        await createOrUpdateSession({
          eventId: event.id,
          patientId: patient.id,
          therapistId: getTherapistId(calendarId),
          startTime: event.start.dateTime,
          endTime: event.end.dateTime
        });
      }
    }
  }
}
```

---

### 2. Google Drive API

#### **Configuración**
```typescript
// Google Picker API
{
  "apiKey": "...",
  "clientId": "...",
  "appId": "...",
  "scope": "https://www.googleapis.com/auth/drive.readonly"
}
```

#### **Implementación**
```typescript
// Frontend: Selector de archivos
function openDrivePicker() {
  const picker = new google.picker.PickerBuilder()
    .addView(google.picker.ViewId.DOCS)
    .setOAuthToken(accessToken)
    .setCallback(pickerCallback)
    .build();
  
  picker.setVisible(true);
}

function pickerCallback(data) {
  if (data.action === google.picker.Action.PICKED) {
    const file = data.docs[0];
    const driveLink = file.url;
    // Guardar link en Firestore
  }
}
```

---

### 3. Google Gemini API (Futuro)

#### **Configuración Planeada**
```typescript
{
  "model": "gemini-pro",
  "apiKey": "...",
  "endpoint": "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent"
}
```

#### **Uso Planeado**
```typescript
// Generar reporte mensual
async function generateMonthlyReport(patientId: string, month: string) {
  const sessions = await getSessionsForMonth(patientId, month);
  const progressData = await getProgressData(patientId);
  
  const prompt = `
    Genera un reporte mensual profesional para:
    Paciente: ${patient.name}
    Mes: ${month}
    
    Sesiones realizadas: ${sessions.length}
    Datos de progreso: ${JSON.stringify(progressData)}
    
    El reporte debe incluir:
    1. Resumen ejecutivo
    2. Progreso observado
    3. Áreas de mejora
    4. Recomendaciones
  `;
  
  const response = await gemini.generateContent(prompt);
  return response.text;
}
```

---

## 🔒 Seguridad

### Autenticación

#### **Firebase Authentication**
```typescript
// Métodos soportados
{
  "emailPassword": true,
  "googleSignIn": true,
  "passwordReset": true,
  "emailVerification": false // Opcional
}
```

#### **JWT Tokens**
```typescript
// Token structure
{
  "iss": "https://securetoken.google.com/learning-models-hub",
  "aud": "learning-models-hub",
  "auth_time": 1234567890,
  "user_id": "gENhg7u2GJdQnnRuge6ZRleu1ih1",
  "sub": "gENhg7u2GJdQnnRuge6ZRleu1ih1",
  "iat": 1234567890,
  "exp": 1234571490,
  "email": "monica@learningmodels.com.gt",
  "email_verified": true
}
```

### Autorización

#### **Roles y Permisos**
```typescript
const PERMISSIONS = {
  admin: {
    patients: ['read', 'create', 'update', 'delete'],
    sessions: ['read', 'create', 'update', 'delete'],
    payments: ['read', 'create', 'update', 'delete'],
    expenses: ['read', 'create', 'update', 'delete'],
    payrolls: ['read', 'create', 'update', 'delete'],
    users: ['read', 'create', 'update', 'delete']
  },
  editor: {
    patients: ['read', 'create', 'update'],
    sessions: ['read'],
    payments: ['read', 'create', 'update'],
    expenses: [],
    payrolls: [],
    users: ['read']
  },
  therapist: {
    patients: ['read'], // Solo asignados
    sessions: ['read', 'update'], // Solo propias
    payments: [],
    expenses: [],
    payrolls: ['read'], // Solo propia
    users: ['read']
  }
};
```

### Validación de Datos

#### **Frontend Validation (Yup)**
```typescript
const patientSchema = yup.object({
  firstName: yup.string().required('Nombre es requerido'),
  lastName: yup.string().required('Apellido es requerido'),
  dateOfBirth: yup.date().required('Fecha de nacimiento es requerida'),
  grade: yup.string().required('Grado es requerido'),
  school: yup.string().required('Colegio es requerido'),
  currentRate: yup.number().positive().required('Rate es requerido')
});
```

#### **Backend Validation (Firestore Rules)**
```javascript
// Validar estructura de datos
match /patients/{patientId} {
  allow create: if request.resource.data.keys().hasAll([
    'firstName', 'lastName', 'dateOfBirth', 'currentRate'
  ]) && request.resource.data.currentRate is number;
}
```

---

## 🚀 Deployment

### Configuración de Firebase

#### **firebase.json**
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs18",
    "predeploy": ["npm --prefix functions run build"]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

### Pipeline de Deployment

#### **1. Build Frontend**
```bash
# Instalar dependencias
npm install

# Build para producción
npm run build

# Output: dist/
```

#### **2. Deploy Functions**
```bash
# Instalar dependencias
cd functions && npm install

# Deploy
firebase deploy --only functions
```

#### **3. Deploy Hosting**
```bash
firebase deploy --only hosting
```

#### **4. Deploy Firestore Rules**
```bash
firebase deploy --only firestore:rules
```

#### **5. Deploy Completo**
```bash
firebase deploy
```

### Variables de Entorno

#### **Frontend (.env)**
```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=learning-models-hub.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=learning-models-hub
VITE_FIREBASE_STORAGE_BUCKET=learning-models-hub.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

#### **Functions (.env)**
```bash
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
```

---

## 📊 Monitoreo y Logs

### Firebase Console

#### **Métricas Monitoreadas**
- Usuarios activos
- Requests por segundo
- Latencia de Firestore
- Errores de Functions
- Uso de almacenamiento

### Cloud Functions Logs

```typescript
// Logging en Functions
import * as functions from 'firebase-functions';

export const syncCalendar = functions.https.onRequest(async (req, res) => {
  functions.logger.info('Sync started', { timestamp: new Date() });
  
  try {
    const result = await syncAllCalendars();
    functions.logger.info('Sync completed', { result });
    res.json({ success: true, result });
  } catch (error) {
    functions.logger.error('Sync failed', { error });
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### Error Tracking

```typescript
// Frontend error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to Firebase Analytics
    logEvent(analytics, 'exception', {
      description: error.message,
      fatal: true
    });
  }
}
```

---

## 📝 Conclusión

Este documento técnico proporciona una visión completa de la arquitectura y tecnologías utilizadas en Learning Models HUB. La plataforma está construida con tecnologías modernas y escalables que garantizan:

✅ **Rendimiento** óptimo  
✅ **Seguridad** robusta  
✅ **Escalabilidad** automática  
✅ **Mantenibilidad** a largo plazo  
✅ **Integración** fluida con servicios externos  

---

**Documento creado:** Octubre 2025  
**Última actualización:** Octubre 2025  
**Versión:** 1.0
