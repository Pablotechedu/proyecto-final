# Lógica y Reglas de Negocio por Módulo
## Learning Models HUB

**Versión:** 1.0  
**Fecha:** Enero 2025  
**Propósito:** Documentar la lógica de negocio y reglas de cada módulo del sistema

---

## 📋 Índice

1. [Módulo de Autenticación y Usuarios](#1-módulo-de-autenticación-y-usuarios)
2. [Módulo Dashboard Financiero](#2-módulo-dashboard-financiero)
3. [Módulo Mi Hub (Terapeuta)](#3-módulo-mi-hub-terapeuta)
4. [Módulo de Pacientes](#4-módulo-de-pacientes)
5. [Módulo de Sesiones](#5-módulo-de-sesiones)
6. [Módulo de Pagos](#6-módulo-de-pagos)
7. [Módulo de Formularios de Sesión](#7-módulo-de-formularios-de-sesión)
8. [Sincronización con Google Calendar](#8-sincronización-con-google-calendar)

---

## 1. Módulo de Autenticación y Usuarios

### 🎯 Propósito
Gestionar el acceso al sistema mediante roles y permisos diferenciados.

### 👥 Roles y Permisos

#### **Admin (Administrador)**
**Usuarios:** Mónica de Aguilar, Pablo Aguilar, María Fernanda Laugerud

**Reglas de Negocio:**
- ✅ Acceso completo a todos los módulos
- ✅ Puede ver y gestionar información financiera
- ✅ Puede crear, editar y eliminar usuarios
- ✅ Puede configurar rates de pacientes
- ✅ Puede ver gastos y planillas
- ✅ Puede gestionar pagos y cuentas por cobrar

**Lógica de Acceso:**
```typescript
if (user.role === 'admin' || user.isDirector) {
  // Acceso total al sistema
  canAccessFinancialDashboard = true
  canManagePayments = true
  canManageExpenses = true
  canManagePayrolls = true
  canManageUsers = true
}
```

#### **Editor**
**Usuarios:** Fernanda Muñoz

**Reglas de Negocio:**
- ✅ Puede gestionar pacientes (crear, editar, ver)
- ✅ Puede registrar pagos
- ✅ Puede ver sesiones
- ❌ NO puede ver gastos
- ❌ NO puede ver planillas
- ❌ NO puede gestionar usuarios

**Lógica de Acceso:**
```typescript
if (user.role === 'editor') {
  canManagePatients = true
  canRegisterPayments = true
  canViewSessions = true
  canAccessFinancialDashboard = false
  canManageExpenses = false
}
```

#### **Therapist (Terapeuta)**
**Usuarios:** Miranda Navas, Ximena Maldonado, Jimena Corzo, Fernanda Muñoz

**Reglas de Negocio:**
- ✅ Puede ver SOLO sus pacientes asignados
- ✅ Puede completar formularios de sesión
- ✅ Puede ver su agenda del día
- ✅ Puede ver tareas pendientes (formularios incompletos)
- ❌ NO puede ver información financiera
- ❌ NO puede ver pacientes de otros terapeutas
- ❌ NO puede gestionar pagos

**Lógica de Acceso:**
```typescript
if (user.role === 'therapist') {
  canViewOwnPatients = true
  canCompleteSessionForms = true
  canViewOwnAgenda = true
  canAccessTherapistHub = true
  canAccessFinancialDashboard = false
  canViewOtherTherapists = false
}
```

#### **Director**
**Usuario:** Mónica de Aguilar

**Reglas de Negocio:**
- ✅ Tiene TODOS los permisos de Admin
- ✅ ADEMÁS tiene acceso como Terapeuta
- ✅ Campo especial: `isDirector: true`
- ✅ Puede ver tanto Dashboard Financiero como Mi Hub

**Lógica de Acceso:**
```typescript
if (user.isDirector) {
  // Hereda todos los permisos de admin
  ...adminPermissions
  // ADEMÁS puede acceder a funcionalidades de terapeuta
  canAccessTherapistHub = true
  canCompleteSessionForms = true
}
```

### 🔐 Reglas de Seguridad (Firestore)

**Colección `users`:**
- Lectura: Cualquier usuario autenticado
- Escritura: Solo Admin o Service Account

**Validación en Frontend:**
```typescript
const isAdminOrEditor = user?.role === 'admin' || 
                        user?.role === 'editor' || 
                        user?.isDirector

const isTherapist = user?.role === 'therapist' || user?.isDirector
```

---

## 2. Módulo Dashboard Financiero

### 🎯 Propósito
Proporcionar visibilidad financiera en tiempo real del centro de terapias.

### 👁️ Control de Acceso

**Regla Principal:**
```typescript
// Solo Admin, Editor con permisos, o Director pueden acceder
if (!isAdminOrEditor) {
  // Redirigir a Mi Hub o mostrar mensaje
  return <Alert>Esta página es solo para administradores</Alert>
}
```

### 📊 KPIs Calculados

#### **1. Ingresos Cobrados del Mes**

**Lógica de Cálculo:**
```typescript
const totalCollected = payments
  .filter(p => p.monthCovered === currentMonth)
  .reduce((sum, p) => sum + p.amount, 0)
```

**Reglas:**
- Solo cuenta pagos del mes actual
- Suma todos los tipos: Terapia, Evaluación, Otro
- Se actualiza en tiempo real cuando se registra un pago

#### **2. Cuentas por Cobrar**

**Lógica de Cálculo:**
```typescript
// Simplificado por ahora
const accountsReceivable = totalInvoiced - totalCollected

// Futuro: Basado en sesiones completadas sin pago
const accountsReceivable = sessions
  .filter(s => s.status === 'Completed' && !s.paid)
  .reduce((sum, s) => sum + (s.duration * patient.currentRate), 0)
```

**Reglas:**
- Muestra monto total pendiente de cobro
- Lista de pacientes con pagos atrasados
- Días de atraso calculados desde fecha de sesión

#### **3. Gastos del Mes**

**Lógica de Cálculo:**
```typescript
const totalExpenses = expenses
  .filter(e => {
    const expenseDate = new Date(e.date)
    return expenseDate >= firstDayOfMonth && 
           expenseDate <= lastDayOfMonth
  })
  .reduce((sum, e) => sum + e.amount, 0)
```

**Reglas:**
- Solo Admin puede ver gastos
- Incluye: planilla, gastos fijos, gastos variables
- Se actualiza cuando se registra un gasto

#### **4. Ingreso Neto**

**Lógica de Cálculo:**
```typescript
const netIncome = totalCollected - totalExpenses
```

**Reglas:**
- Puede ser negativo (se muestra en rojo)
- Se compara con mes anterior para tendencia
- Solo visible para Admin

### 📈 Desglose de Ingresos por Tipo

**Lógica:**
```typescript
const incomeByType = {
  terapia: payments
    .filter(p => p.type === 'Terapia')
    .reduce((sum, p) => sum + p.amount, 0),
  
  evaluacion: payments
    .filter(p => p.type === 'Evaluacion')
    .reduce((sum, p) => sum + p.amount, 0),
  
  otro: payments
    .filter(p => p.type === 'Otro')
    .reduce((sum, p) => sum + p.amount, 0)
}
```

**Visualización:**
- Barras de progreso proporcionales al total
- Colores diferenciados por tipo
- Porcentaje calculado automáticamente

### 📋 Últimos Pagos Registrados

**Lógica:**
```typescript
const recentPayments = await getRecentPayments(5)
// Ordenados por fecha descendente
// Muestra: paciente, tipo, fecha, monto
```

**Reglas:**
- Muestra últimos 5 pagos
- Click en "Ver" redirige a módulo de Pagos
- Actualización en tiempo real

---

## 3. Módulo Mi Hub (Terapeuta)

### 🎯 Propósito
Proporcionar a las terapeutas una vista centralizada de su día de trabajo.

### 👁️ Control de Acceso

**Regla Principal:**
```typescript
if (user.role !== 'therapist' && !user.isDirector) {
  return <Alert>Esta página es solo para terapeutas</Alert>
}
```

### 📅 Estructura del Hub

#### **Columna Izquierda: Tareas Pendientes**

**Lógica de Obtención:**
```typescript
const tasks = await getPendingTasks(user.uid)

// Obtiene sesiones completadas sin formulario
const pendingForms = sessions
  .filter(s => 
    s.therapistId === user.uid &&
    s.status === 'Completed' &&
    s.formCompleted === false
  )
  .orderBy('startTime', 'desc')
```

**Priorización:**
```typescript
const daysSince = Math.floor(
  (Date.now() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
)

const priority = daysSince > 2 ? 'high' : 
                 daysSince > 0 ? 'medium' : 
                 'low'
```

**Reglas:**
- Prioridad ALTA: Más de 2 días sin completar
- Prioridad MEDIA: 1-2 días sin completar
- Prioridad BAJA: Mismo día
- Click en "Ir ahora" abre el formulario de sesión

#### **Columna Derecha: Agenda del Día**

**Lógica de Obtención:**
```typescript
const todaySessions = await getTodaySessions(user.uid)

// Filtra sesiones del día actual
const today = new Date()
today.setHours(0, 0, 0, 0)
const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)

const sessions = allSessions.filter(s => 
  s.startTime >= today && 
  s.startTime < tomorrow &&
  s.therapistId === user.uid
)
```

**Visualización:**
- Línea de tiempo ordenada por hora
- Duración calculada automáticamente
- Estados con colores:
  - Verde: Completada
  - Azul: Programada
  - Rojo: Cancelada
- Indicador de formulario pendiente (⚠️)

**Interacciones:**
- Click en tarjeta → Abre formulario de sesión
- Click en nombre paciente → Abre ficha del paciente

### 📊 Resumen de Actividades

**Lógica:**
```typescript
const summary = {
  totalSessions: sessions.length,
  completedSessions: sessions.filter(s => s.status === 'Completed').length,
  pendingTasks: tasks.length
}
```

---

## 4. Módulo de Pacientes

### 🎯 Propósito
Gestionar toda la información de los pacientes del centro.

### 📋 Lista de Pacientes

#### **Búsqueda y Filtros**

**Lógica de Búsqueda:**
```typescript
const searchLower = searchTerm.toLowerCase()
const filtered = patients.filter(patient =>
  patient.firstName?.toLowerCase().includes(searchLower) ||
  patient.lastName?.toLowerCase().includes(searchLower) ||
  patient.patientCode?.toLowerCase().includes(searchLower) ||
  patient.school?.toLowerCase().includes(searchLower)
)
```

**Filtro por Estado:**
```typescript
if (statusFilter !== 'all') {
  filtered = filtered.filter(p => p.status === statusFilter)
}
// Opciones: 'all', 'active', 'inactive'
```

**Filtro por Terapeuta:**
```typescript
if (therapistFilter !== 'all') {
  filtered = filtered.filter(p => 
    p.therapistName === therapistFilter
  )
}
```

#### **Enriquecimiento de Datos**

**Última Sesión:**
```typescript
const lastSession = await getLastSession(patient.id)
// Query: sessions where patientId == patient.id
//        orderBy startTime desc
//        limit 1
```

**Próxima Sesión:**
```typescript
const nextSession = await getNextSession(patient.id)
// Query: sessions where patientId == patient.id
//        where status == 'Scheduled'
//        orderBy startTime asc
//        limit 1
```

**Estado de Pago (solo Admin/Editor):**
```typescript
if (isAdminOrEditor) {
  const currentMonth = new Date().toLocaleString('es-GT', {
    month: 'long',
    year: 'numeric'
  })
  
  const payments = await getPaymentsForMonth(patient.id, currentMonth)
  
  patient.paymentStatus = payments.length > 0 ? 'paid' : 'pending'
}
```

### 👤 Ficha del Paciente

#### **Información Básica**

**Cálculo de Edad:**
```typescript
const calculateAge = (birthDate: string) => {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}
```

**Nombre Completo:**
```typescript
const getFullName = (patient: Patient) => {
  return `${patient.firstName} ${patient.lastName}`
}
```

#### **Gestión de Rates**

**Rate Actual:**
```typescript
// El rate actual se almacena en patient.currentRate
// Se aplica a todas las sesiones nuevas
```

**Historial de Rates:**
```typescript
interface RateHistory {
  rate: number
  startDate: string
  endDate: string | null  // null = rate actual
}

// Al cambiar el rate:
// 1. Cerrar el rate anterior (endDate = hoy)
// 2. Crear nuevo rate (startDate = hoy, endDate = null)
// 3. Actualizar currentRate
```

**Aplicación en Sesiones:**
```typescript
// Al calcular costo de sesión:
const sessionDate = new Date(session.startTime)
const applicableRate = patient.rateHistory.find(r => 
  new Date(r.startDate) <= sessionDate &&
  (r.endDate === null || new Date(r.endDate) >= sessionDate)
)

const sessionCost = session.duration * applicableRate.rate
```

#### **Subcollections**

**Parent/Tutors:**
```typescript
// Ruta: patients/{patientId}/parentTutors/{parentId}
interface ParentTutor {
  name: string
  email: string
  phone: string
  relationship: 'Madre' | 'Padre' | 'Tutor' | 'Otro'
}
```

**Related Professionals:**
```typescript
// Ruta: patients/{patientId}/relatedProfessionals/{professionalId}
interface RelatedProfessional {
  name: string
  specialty: string
  contact: string
  notes?: string
}
```

### 🔒 Reglas de Seguridad

**Lectura:**
- Todos los usuarios autenticados pueden leer pacientes
- Terapeutas solo ven sus pacientes asignados (filtrado en frontend)

**Escritura:**
- Solo Admin o Editor pueden crear/editar pacientes
- Terapeutas NO pueden modificar información de pacientes

---

## 5. Módulo de Sesiones

### 🎯 Propósito
Gestionar las sesiones terapéuticas y su sincronización con Google Calendar.

### 📅 Tipos de Sesiones

**Por Origen:**
1. **Google Calendar** (`source: 'google_calendar'`)
   - Creadas automáticamente por sincronización
   - ID: `gcal_[eventId]`
   - No se pueden eliminar manualmente

2. **Manual** (`source: 'manual'`)
   - Creadas directamente en el sistema
   - Pueden editarse y eliminarse

### 📊 Estados de Sesión

```typescript
type SessionStatus = 
  | 'Scheduled'   // Programada (futuro)
  | 'Completed'   // Completada (pasado)
  | 'Cancelled'   // Cancelada
  | 'NoShow'      // Paciente no asistió
```

**Transiciones de Estado:**
```typescript
// Al completar formulario:
if (formData.attendance === 'Presente') {
  session.status = 'Completed'
  session.formCompleted = true
}

if (formData.attendance === 'Ausente sin aviso') {
  session.status = 'NoShow'
}

if (formData.attendance === 'Ausente con aviso') {
  session.status = 'Cancelled'
}
```

### ⏱️ Cálculo de Duración

**En Horas:**
```typescript
const calculateDuration = (startTime: string, endTime: string) => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const durationMs = end.getTime() - start.getTime()
  const durationHours = durationMs / (1000 * 60 * 60)
  
  return durationHours
}
```

**En Minutos (para visualización):**
```typescript
const calculateDurationMinutes = (startTime: string, endTime: string) => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60))
}
```

### 📝 Formulario de Sesión

**Regla de Completitud:**
```typescript
session.formCompleted = session.formData !== null && 
                        session.formData !== undefined
```

**Acceso al Formulario:**
- Cualquier terapeuta puede completar el formulario de su sesión
- Admin/Director pueden completar cualquier formulario
- Una vez completado, puede editarse

### 🔍 Consultas Comunes

**Sesiones del Día (Terapeuta):**
```typescript
// Firestore Query
sessions
  .where('therapistId', '==', therapistId)
  .where('startTime', '>=', startOfToday)
  .where('startTime', '<', startOfTomorrow)
  .orderBy('startTime', 'asc')
```

**Sesiones de un Paciente:**
```typescript
// Firestore Query
sessions
  .where('patientId', '==', patientId)
  .orderBy('startTime', 'desc')
  .limit(20)
```

**Formularios Pendientes:**
```typescript
// Firestore Query
sessions
  .where('therapistId', '==', therapistId)
  .where('status', '==', 'Completed')
  .where('formCompleted', '==', false)
  .orderBy('startTime', 'desc')
```

---

## 6. Módulo de Pagos

### 🎯 Propósito
Registrar y gestionar los pagos de los pacientes.

### 💰 Tipos de Pago

```typescript
type PaymentType = 
  | 'Terapia'      // Pago por sesiones de terapia
  | 'Evaluacion'   // Pago por evaluación (puede ser en cuotas)
  | 'Otro'         // Otros servicios
```

### 📅 Registro de Pago

**Campos Requeridos:**
```typescript
interface Payment {
  patientId: string          // ID del paciente
  patientCode: string        // Código del paciente
  patientName: string        // Nombre completo
  amount: number             // Monto total
  paymentDate: string        // Fecha de pago
  paymentMethod: string      // Efectivo, Transferencia, etc.
  monthCovered: string       // "enero 2025"
  type: PaymentType          // Terapia, Evaluacion, Otro
  driveLink?: string         // Link a boleta en Google Drive
}
```

**Validaciones:**
```typescript
// Monto debe ser mayor a 0
if (amount <= 0) {
  throw new Error('El monto debe ser mayor a 0')
}

// Fecha no puede ser futura
if (paymentDate > new Date()) {
  throw new Error('La fecha de pago no puede ser futura')
}

// Paciente debe existir
const patient = await getPatient(patientId)
if (!patient) {
  throw new Error('Paciente no encontrado')
}
```

### 📊 Sistema de Cuotas (Evaluaciones)

**Lógica de Cuotas:**
```typescript
if (paymentType === 'Evaluacion') {
  // Dividir en 3 cuotas iguales
  const installmentAmount = totalAmount / 3
  
  const installments = [
    {
      number: 1,
      amount: installmentAmount,
      dueDate: paymentDate,  // Primera cuota = fecha de pago
      paid: true,
      paidDate: paymentDate
    },
    {
      number: 2,
      amount: installmentAmount,
      dueDate: addMonths(paymentDate, 1),
      paid: false
    },
    {
      number: 3,
      amount: installmentAmount,
      dueDate: addMonths(paymentDate, 2),
      paid: false
    }
  ]
}
```

**Edición de Cuotas:**
- Admin/Editor puede modificar montos de cuotas
- Suma de cuotas debe = monto total
- Puede marcar cuotas como pagadas

**Seguimiento:**
```typescript
const paidInstallments = installments.filter(i => i.paid).length
const pendingInstallments = installments.filter(i => !i.paid).length
const totalPaid = installments
  .filter(i => i.paid)
  .reduce((sum, i) => sum + i.amount, 0)
```

### 🔗 Integración con Google Drive

**Google Drive Picker:**
```typescript
// Al seleccionar archivo en Drive:
const fileLink = `https://drive.google.com/file/d/${fileId}/view`

// Se guarda solo el link, NO el archivo
payment.driveLink = fileLink
```

**Acceso al Archivo:**
- Click en link abre archivo en nueva pestaña
- Requiere permisos de Google Drive
- Archivo permanece en Drive (no se duplica)

### 📈 Cálculos Financieros

**Total Cobrado del Mes:**
```typescript
const currentMonth = new Date().toLocaleString('es-GT', {
  month: 'long',
  year: 'numeric'
})

const totalCollected = payments
  .filter(p => p.monthCovered === currentMonth)
  .reduce((sum, p) => sum + p.amount, 0)
```

**Por Tipo de Servicio:**
```typescript
const byType = {
  terapia: payments
    .filter(p => p.type === 'Terapia' && p.monthCovered === currentMonth)
    .reduce((sum, p) => sum + p.amount, 0),
  
  evaluacion: payments
    .filter(p => p.type === 'Evaluacion' && p.monthCovered === currentMonth)
    .reduce((sum, p) => sum + p.amount, 0),
  
  otro: payments
    .filter(p => p.type === 'Otro' && p.monthCovered === currentMonth)
    .reduce((sum, p) => sum + p.amount, 0)
}
```

### 🔒 Reglas de Seguridad

**Lectura:**
- Todos los usuarios autenticados pueden leer pagos

**Escritura:**
- Solo Admin o Editor pueden crear/editar pagos
- Terapeutas NO pueden gestionar pagos

---

## 7. Módulo de Formularios de Sesión

### 🎯 Propósito
Capturar información detallada de cada sesión terapéutica de forma dinámica.

### 📋 Estructura del Formulario

#### **Secciones Siempre Visibles**

**I. Información General y Conducta**

Campos:
```typescript
{
  attendance: 'Presente' | 'Ausente con aviso' | 'Ausente sin aviso'
  modality: 'En línea' | 'Presencial'
  energyLevel: 1 | 2 | 3 | 4 | 5  // Escala
  adherence: 'Excelente' | 'Buena' | 'Variable' | 'Requiere motivación constante'
  adherenceComments?: string
  technicalDifficulties: boolean
  technicalDifficultiesDescription?: string
  independence: 'Autónomo' | 'Requiere guía mínima' | 'Requiere apoyo constante'
}
```

**Reglas:**
- Si `attendance !== 'Presente'`, el formulario se completa aquí
- Si hay dificultades técnicas, campo de descripción es requerido

**II. Funciones Ejecutivas**

Campos:
```typescript
{
  impulseControl: 'Adecuado' | 'Presenta impulsividad ocasional' | 'Dificultad para controlar impulsos'
  followInstructions: 'Inmediatamente' | 'Requiere repetición' | 'Muestra resistencia'
  frustrationManagement: 'Regula sus emociones' | 'Expresa frustración verbalmente' | 'Abandona la tarea' | 'Actitud respetuosa a pesar del reto'
  predominantEmotions: string[]  // Multi-select
  taskInitiative: 'Espontánea y proactiva' | 'Requiere orientación para iniciar' | 'Muestra resistencia a tareas difíciles'
  selfMonitoring: 'Identifica y corrige errores de forma autónoma' | 'Identifica pero necesita ayuda para corregir' | 'No percibe sus errores'
  cognitiveFlexibility: 'Flexible y sin dificultad' | 'Muestra resistencia inicial pero se adapta' | 'Se desorganiza con los cambios'
}
```

#### **Secciones Condicionales (On-Demand)**

**Selector de Objetivos:**
```typescript
sessionObjectives: string[]  // Multi-select

// Opciones:
[
  'Lectoescritura',
  'Matemáticas',
  'Terapia Emocional',
  'Rehabilitación Cognitiva',
  'Tutorías'
]
```

**Lógica de Renderizado:**
```typescript
const showLectoescritura = sessionObjectives.includes('Lectoescritura')
const showMathematics = sessionObjectives.includes('Matemáticas')
const showEmotionalTherapy = sessionObjectives.includes('Terapia Emocional')
const showCognitiveRehab = sessionObjectives.includes('Rehabilitación Cognitiva')
const showTutoring = sessionObjectives.includes('Tutorías')
```

### 📖 III. Lectoescritura (Condicional)

**Cálculo Automático de PPM (Palabras Por Minuto):**

```typescript
// Inputs del usuario:
const itemsRead = 150        // palabras leídas
const timeMinutes = 2        // minutos
const timeSeconds = 30       // segundos

// Cálculo:
const totalSeconds = (timeMinutes * 60) + timeSeconds
const totalMinutes = totalSeconds / 60
const wordsPerMinute = Math.round(itemsRead / totalMinutes)

// Resultado: 60 PPM
```

**Comparación con Esperado:**
```typescript
const expectedPPM = 80  // Ingresado por terapeuta

const difference = wordsPerMinute - expectedPPM
const percentage = (difference / expectedPPM) * 100

if (percentage >= 0) {
  status = `${percentage}% por encima del esperado`
} else {
  status = `${Math.abs(percentage)}% por debajo del esperado`
}
```

**Análisis de Precisión:**
```typescript
const totalErrors = omissions + insertions + incorrectPronunciations
const totalWords = itemsRead
const accuracy = ((totalWords - totalErrors) / totalWords) * 100

// Autocorrecciones NO cuentan como errores
```

**Campos:**
```typescript
{
  objectives: string[]  // Multi-select de objetivos específicos
  readingType: string
  itemsRead: number
  timeMinutes: number
  timeSeconds: number
  wordsPerMinute: number  // Calculado automáticamente
  expectedPPM: number
  accuracy: number  // Calculado automáticamente
  omissions: number
  insertions: number
  selfCorrections: number
  incorrectPronunciations: number
  phonologicalAwareness: string  // Texto libre
  comprehension: string  // Texto libre
  writingSkills: string[]  // Multi-select
  writingObservations: string  // Texto libre
}
```

### 🔢 IV. Matemáticas (Condicional)

**Estructura:**
```typescript
{
  objectives: string[]  // Multi-select
  skillsWorked: Array<{
    skill: string
    masteryLevel: 'Excelente (independiente)' | 
                  'Bueno (con recordatorios)' | 
                  'En proceso (necesita apoyo constante)'
  }>
  strategiesUsed: string[]  // Multi-select
  qualitativeObservations: string  // Texto libre
}
```

**Lógica de Habilidades:**
- Terapeuta puede agregar múltiples habilidades
- Cada habilidad tiene su nivel de dominio
- Se pueden eliminar habilidades agregadas

### 💭 V. Terapia Emocional (Condicional)

**Estructura:**
```typescript
{
  program: 'Terapia Racional Emotiva Conductual (REBT)' | 
           'Mentalidad de Crecimiento (Growth Mindset)' | 
           'Regulación emocional' | 
           'Habilidades sociales'
  situationAddressed: string  // Texto libre
  emotionsExplored: string[]  // Multi-select
  skillsPracticed: string[]   // Multi-select
  patientAttitude: string     // Texto libre
  progressObserved: string    // Texto libre
}
```

**Reglas:**
- Programa/enfoque es requerido
- Situación abordada describe el contexto de la sesión
- Emociones y habilidades son multi-select
- Observaciones cualitativas del progreso

### 🧠 VI. Rehabilitación Cognitiva (Condicional)

**Estructura:**
```typescript
{
  functionsWorked: string[]  // Multi-select
  generalScore?: number      // 0-100
  attentionScore?: number    // 0-100
  memoryScore?: number       // 0-100
  executiveFunctionsScore?: number  // 0-100
  selfEvaluation: 'Optimista (se califica como excelente)' | 
                  'Realista' | 
                  'Negativo'
  persistence: 'Persistente' | 
               'Se rinde fácilmente' | 
               'Pide ayuda adecuadamente'
  motorDifficulties: boolean
  motorDifficultiesDescription?: string
  waitsForInstructions: 'Sí' | 'No' | 'A veces'
}
```

**Reglas:**
- Scores son opcionales (de NeuronUP u otra plataforma)
- Si hay dificultades motoras, descripción es requerida
- Observaciones conductuales son clave

### 📚 VII. Tutorías (Condicional)

**Estructura:**
```typescript
{
  sessionFocus: string  // Texto libre
}
```

**Reglas:**
- Campo de texto libre para describir el enfoque de la tutoría
- Puede incluir materia, tema específico, actividades realizadas

### 📝 VIII. Recomendaciones (Siempre Visible)

**Estructura:**
```typescript
{
  academicRecommendations: string  // Texto libre
  homeSupport: string              // Texto libre
  therapeuticStrategies: string    // Texto libre
}
```

**Reglas:**
- Todos los campos son requeridos
- Área académica: Recomendaciones para el colegio
- Apoyo en casa: Sugerencias para padres/tutores
- Estrategias terapéuticas: Plan para próximas sesiones

### 🔄 Lógica de Guardado

**Merge de Datos:**
```typescript
// Si ya existe formData, hacer merge
const updatedFormData = {
  ...existingFormData,
  ...newFormData
}

// Actualizar sesión
await updateSession(sessionId, {
  formData: updatedFormData,
  formCompleted: true,
  status: determineStatus(newFormData.attendance)
})
```

**Validaciones:**
```typescript
// Validación por sección
const validateSection = (sectionName: string, data: any) => {
  switch(sectionName) {
    case 'general':
      return data.attendance && data.modality && data.energyLevel
    case 'executiveFunctions':
      return data.impulseControl && data.followInstructions
    // ... más validaciones
  }
}

// Validación global
const isFormValid = () => {
  return validateSection('general', formData) &&
         validateSection('executiveFunctions', formData) &&
         validateSection('recommendations', formData) &&
         validateConditionalSections(formData)
}
```

---

## 8. Sincronización con Google Calendar

### 🎯 Propósito
Automatizar la creación de sesiones desde los calendarios de Google de las terapeutas.

### 🔧 Configuración Técnica

**Service Account:**
```
learning-models-hub@appspot.gserviceaccount.com
```

**Domain-Wide Delegation:**
- Habilitado en Google Workspace
- Client ID: [ID del Service Account]
- Scopes: `https://www.googleapis.com/auth/calendar.readonly`
- Subject (delegación): `monica@learningmodels.com.gt`

**Calendarios Sincronizados:**
1. monica@learningmodels.com.gt
2. ximena@learningmodels.com.gt
3. miranda@learningmodels.com.gt
4. fernanda@learningmodels.com.gt
5. mariajimena@learningmodels.com.gt

### ⏰ Programación

**Cloud Scheduler:**
```
Nombre: sync-calendar-midday
Frecuencia: 30 12 * * 1-5  (12:30 PM, Lunes a Viernes)
Timezone: America/Guatemala
Target: Cloud Function syncCalendar

Nombre: sync-calendar-evening
Frecuencia: 0 21 * * 1-5   (9:00 PM, Lunes a Viernes)
Timezone: America/Guatemala
Target: Cloud Function syncCalendar
```

**Reglas:**
- Solo se ejecuta de Lunes a Viernes
- Dos sincronizaciones diarias
- No se ejecuta en fines de semana

### 🔍 Lógica de Sincronización

#### **1. Obtener Eventos del Calendar**

```typescript
// Para cada calendario:
const calendar = google.calendar({ version: 'v3', auth })

const events = await calendar.events.list({
  calendarId: therapistEmail,
  timeMin: startOfMonth.toISOString(),
  timeMax: endOfMonth.toISOString(),
  singleEvents: true,
  orderBy: 'startTime'
})
```

**Reglas:**
- Solo eventos del mes actual
- Eventos recurrentes se expanden (singleEvents: true)
- Ordenados por hora de inicio

#### **2. Identificar Paciente**

**Método 1: Por Código en Description**
```typescript
// Buscar patrón: Código: NOMBRE_APELLIDO01
const codeMatch = event.description?.match(/Código:\s*([A-Za-z_]+\d+)/)
const patientCode = codeMatch ? codeMatch[1] : null

if (patientCode) {
  const patient = await findPatientByCode(patientCode)
}
```

**Método 2: Por Nombre en Title**
```typescript
// Si no hay código, buscar por nombre en el título
const patientName = event.summary
const patient = await findPatientByName(patientName)
```

**Reglas:**
- Prioridad 1: Código en Description
- Prioridad 2: Nombre en Title
- Si no se encuentra paciente, se omite el evento

#### **3. Crear/Actualizar Sesión**

```typescript
const sessionId = `gcal_${event.id}`

// Verificar si ya existe
const existingSession = await getSession(sessionId)

if (existingSession) {
  // Actualizar solo si cambió algo
  if (hasChanges(existingSession, event)) {
    await updateSession(sessionId, {
      startTime: event.start.dateTime,
      endTime: event.end.dateTime,
      title: event.summary,
      location: event.location
    })
  }
} else {
  // Crear nueva sesión
  await createSession({
    id: sessionId,
    patientId: patient.id,
    patientCode: patient.patientCode,
    patientName: getFullName(patient),
    therapistId: therapist.uid,
    therapistName: therapist.name,
    startTime: event.start.dateTime,
    endTime: event.end.dateTime,
    duration: calculateDuration(event.start.dateTime, event.end.dateTime),
    title: event.summary,
    location: event.location || 'No especificado',
    source: 'google_calendar',
    calendarId: therapistEmail,
    googleEventId: event.id,
    status: isPast(event.start.dateTime) ? 'Completed' : 'Scheduled',
    formCompleted: false
  })
}
```

**Reglas:**
- ID de sesión = `gcal_${eventId}` (único)
- Si evento ya pasó → status = 'Completed'
- Si evento es futuro → status = 'Scheduled'
- formCompleted siempre inicia en false

#### **4. Cálculo de Duración**

```typescript
const calculateDuration = (start: string, end: string) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const durationMs = endDate.getTime() - startDate.getTime()
  const durationHours = durationMs / (1000 * 60 * 60)
  
  return Math.round(durationHours * 100) / 100  // 2 decimales
}
```

**Ejemplos:**
- 1 hora → 1.00
- 1 hora 30 min → 1.50
- 45 min → 0.75

### 🚫 Eventos Omitidos

**Se omiten eventos que:**
1. No tienen código de paciente ni nombre reconocible
2. Son eventos de todo el día (all-day events)
3. Están marcados como "Cancelado" en Calendar
4. No tienen hora de inicio/fin definida

### 📊 Logging y Monitoreo

**Logs Generados:**
```typescript
console.log(`Sincronizando calendario: ${therapistEmail}`)
console.log(`Eventos encontrados: ${events.length}`)
console.log(`Sesiones creadas: ${created}`)
console.log(`Sesiones actualizadas: ${updated}`)
console.log(`Eventos omitidos: ${skipped}`)
```

**Errores Comunes:**
```typescript
// Error: Paciente no encontrado
if (!patient) {
  console.warn(`Paciente no encontrado para evento: ${event.summary}`)
  skipped++
  continue
}

// Error: Terapeuta no encontrado
if (!therapist) {
  console.error(`Terapeuta no encontrado: ${therapistEmail}`)
  return
}

// Error: Permisos de Calendar
if (error.code === 403) {
  console.error(`Sin permisos para acceder a: ${therapistEmail}`)
}
```

### 🔄 Flujo Completo

```
1. Cloud Scheduler dispara función (12:30 PM o 9:00 PM)
   ↓
2. Para cada terapeuta en la lista:
   ↓
3. Autenticar con Service Account (delegación)
   ↓
4. Obtener eventos del mes del calendario
   ↓
5. Para cada evento:
   ↓
6. Identificar paciente (por código o nombre)
   ↓
7. Si paciente existe:
   ↓
8. Crear o actualizar sesión en Firestore
   ↓
9. Registrar en logs
   ↓
10. Continuar con siguiente evento
    ↓
11. Continuar con siguiente terapeuta
    ↓
12. Finalizar sincronización
```

### 🔐 Seguridad

**Reglas de Firestore:**
```typescript
// Service Account puede escribir sesiones
match /sessions/{sessionId} {
  allow write: if isServiceAccount()
}

function isServiceAccount() {
  return request.auth != null && 
         request.auth.token.email != null &&
         request.auth.token.email.matches('.*@.*\\.iam\\.gserviceaccount\\.com$')
}
```

**Variables de Entorno:**
```
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

---

## 📊 Resumen de Reglas de Negocio Clave

### Por Rol

**Admin/Director:**
- ✅ Acceso total al sistema
- ✅ Ve dashboard financiero
- ✅ Gestiona pagos y gastos
- ✅ Configura rates de pacientes
- ✅ Puede completar formularios de cualquier sesión

**Editor:**
- ✅ Gestiona pacientes
- ✅ Registra pagos
- ❌ NO ve gastos ni planillas
- ❌ NO gestiona usuarios

**Terapeuta:**
- ✅ Ve solo sus pacientes
- ✅ Completa formularios de sus sesiones
- ✅ Ve su agenda del día
- ❌ NO ve información financiera
- ❌ NO ve otros terapeutas

### Por Módulo

**Dashboard Financiero:**
- Solo Admin/Editor/Director
- KPIs calculados en tiempo real
- Basado en pagos del mes actual

**Mi Hub:**
- Solo Terapeuta/Director
- Tareas priorizadas por antigüedad
- Agenda filtrada por terapeuta

**Pacientes:**
- Todos pueden leer
- Solo Admin/Editor pueden escribir
- Rates con historial completo

**Sesiones:**
- Sincronización automática 2x día
- Estados: Scheduled, Completed, Cancelled, NoShow
- Formularios dinámicos según objetivos

**Pagos:**
- Solo Admin/Editor pueden gestionar
- Evaluaciones en 3 cuotas automáticas
- Integración con Google Drive

**Formularios:**
- Secciones condicionales según objetivos
- Cálculos automáticos (PPM, duración)
- Validaciones por sección

---

## 🎯 Conclusión

Este documento detalla la lógica y reglas de negocio de cada módulo del sistema Learning Models HUB. Cada módulo tiene:

1. **Propósito claro** - Qué problema resuelve
2. **Control de acceso** - Quién puede hacer qué
3. **Lógica de negocio** - Cómo se calculan y procesan los datos
4. **Reglas de validación** - Qué se permite y qué no
5. **Integraciones** - Cómo se conecta con otros sistemas

**Uso de este documento:**
- Referencia para desarrollo de nuevas funcionalidades
- Guía para entender el comportamiento del sistema
- Base para capacitación de nuevos usuarios
- Documentación para mantenimiento y soporte

---

**Última actualización:** Enero 2025  
**Versión:** 1.0
