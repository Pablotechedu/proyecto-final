# Product Requirements Document (PRD)
## Learning Models HUB - Sistema de Gestión Integral

**Versión:** 1.0 (Implementado)  
**Fecha:** Octubre 2025  
**Estado:** En Producción

---

## 📋 Tabla de Contenidos

1. [Visión del Producto](#visión-del-producto)
2. [Objetivos del Negocio](#objetivos-del-negocio)
3. [Usuarios y Roles](#usuarios-y-roles)
4. [Funcionalidades Implementadas](#funcionalidades-implementadas)
5. [Arquitectura Técnica](#arquitectura-técnica)
6. [Roadmap Futuro](#roadmap-futuro)

---

## 🎯 Visión del Producto

Learning Models HUB es una plataforma integral de gestión para un centro de terapias educativas que centraliza:
- Gestión de pacientes y sesiones terapéuticas
- Control financiero y pagos
- Formularios clínicos dinámicos
- Sincronización automática con Google Calendar
- Dashboard analítico para toma de decisiones

**Problema que Resuelve:**
- Elimina trabajo manual repetitivo
- Centraliza información dispersa en múltiples sistemas
- Automatiza cálculos y reportes
- Mejora la eficiencia operativa del equipo

---

## 💼 Objetivos del Negocio

### Objetivos Primarios
1. **Reducir carga administrativa** en un 70%
2. **Centralizar información** en una única plataforma
3. **Automatizar procesos** de registro y cálculo
4. **Mejorar visibilidad financiera** en tiempo real

### Métricas de Éxito
- ✅ Tiempo de registro de sesión: < 5 minutos
- ✅ Tiempo de generación de reportes: < 1 minuto
- ✅ Sincronización automática: 2 veces al día
- ✅ Disponibilidad del sistema: 99.9%

---

## 👥 Usuarios y Roles

### 1. **Administrador (Admin)**
**Usuarios:** Mónica de Aguilar, Pablo Aguilar, María Fernanda Laugerud

**Permisos:**
- ✅ Acceso total a todos los módulos
- ✅ Gestión de pagos y finanzas
- ✅ Configuración del sistema
- ✅ Reportes financieros
- ✅ Gestión de usuarios

**Funcionalidades Clave:**
- Dashboard financiero completo
- Gestión de cuentas por cobrar
- Configuración de rates de pacientes
- Acceso a todos los datos

### 2. **Editor**
**Usuarios:** Fernanda Muñoz

**Permisos:**
- ✅ Gestión de pacientes (crear, editar)
- ✅ Registro de pagos
- ✅ Visualización de sesiones
- ❌ No acceso a planillas
- ❌ No acceso a gastos

**Funcionalidades Clave:**
- Registro de pagos
- Gestión de información de pacientes
- Consulta de sesiones

### 3. **Terapeuta (Therapist)**
**Usuarios:** Miranda Navas, Ximena Maldonado, Jimena Corzo, Fernanda Muñoz

**Permisos:**
- ✅ Ver sus pacientes asignados
- ✅ Completar formularios de sesión
- ✅ Ver su agenda del día
- ❌ No acceso a información financiera
- ❌ No acceso a otros terapeutas

**Funcionalidades Clave:**
- Hub de terapeuta ("¿Qué vamos a hacer hoy?")
- Formularios de sesión dinámicos
- Agenda del día
- Historial de pacientes asignados

### 4. **Director**
**Usuarios:** Mónica de Aguilar

**Permisos:**
- ✅ Todos los permisos de Admin
- ✅ Campo especial `isDirector: true`
- ✅ Acceso prioritario a dashboards

---

## ✅ Funcionalidades Implementadas

### **MÓDULO 1: Autenticación y Usuarios**

#### 1.1 Sistema de Login
- ✅ Autenticación con Firebase Authentication
- ✅ Login con email y contraseña
- ✅ Soporte para Google Sign-In (Google Workspace)
- ✅ Gestión de sesiones
- ✅ Redirección basada en roles

#### 1.2 Gestión de Usuarios
- ✅ 5 usuarios creados y configurados
- ✅ Roles: admin, editor, therapist, director
- ✅ Permisos granulares por rol
- ✅ Contraseña temporal: `LearningModels2025!`

**Usuarios Activos:**
```
monica@learningmodels.com.gt     - Admin, Director
ximena@learningmodels.com.gt     - Therapist
miranda@learningmodels.com.gt    - Therapist
fernanda@learningmodels.com.gt   - Editor, Therapist
mariajimena@learningmodels.com.gt - Therapist
```

---

### **MÓDULO 2: Gestión de Pacientes**

#### 2.1 Lista de Pacientes
- ✅ Vista completa con todos los pacientes
- ✅ Búsqueda por nombre
- ✅ Filtros por estado de pago
- ✅ Indicadores visuales de morosidad
- ✅ Acceso rápido a ficha del paciente

#### 2.2 Ficha del Paciente
- ✅ Información completa del paciente
- ✅ Datos de contacto de padres/tutores
- ✅ Profesionales relacionados (psicólogos, neurólogos, etc.)
- ✅ Historial de sesiones
- ✅ Historial de pagos
- ✅ Rate actual e histórico

**Campos del Paciente:**
```typescript
{
  firstName: string
  lastName: string
  dateOfBirth: Date
  grade: string
  school: string
  diagnosis: string
  currentRate: number
  rateHistory: Array<{rate, startDate, endDate}>
  patientCode: string  // Ej: "Alexia_Urcuyo01"
  parentTutors: Array<{name, email, phone, relationship}>
  relatedProfessionals: Array<{name, specialty, contact}>
}
```

#### 2.3 Gestión de Rates
- ✅ Rate por hora configurable
- ✅ Historial de cambios de rate
- ✅ Aplicación automática según fecha de sesión

---

### **MÓDULO 3: Gestión de Pagos**

#### 3.1 Registro de Pagos
- ✅ Formulario de registro de pago
- ✅ Tipos: Terapia, Evaluación, Otro
- ✅ Integración con Google Drive (links a boletas)
- ✅ Cálculo automático de montos
- ✅ Sistema de cuotas para evaluaciones

#### 3.2 Evaluaciones en Cuotas
- ✅ División automática en 3 cuotas iguales
- ✅ Edición manual de montos por cuota
- ✅ Seguimiento de cuotas pagadas/pendientes

#### 3.3 Historial de Pagos
- ✅ Vista completa por paciente
- ✅ Filtros por fecha y tipo
- ✅ Búsqueda por paciente
- ✅ Exportación de datos

**Estructura de Pago:**
```typescript
{
  patientId: string
  amount: number
  paymentDate: Date
  paymentMethod: string
  driveLink: string  // Link a boleta en Google Drive
  month: string
  type: "Terapia" | "Evaluacion" | "Otro"
  installments?: Array<{amount, dueDate, paid}>
}
```

---

### **MÓDULO 4: Dashboard Financiero**

#### 4.1 KPIs Principales
- ✅ **Ingresos del Mes**
  - Total facturado
  - Total cobrado
  - % de cobro
  
- ✅ **Cuentas por Cobrar**
  - Monto total pendiente
  - Lista de pacientes morosos
  - Días de atraso

- ✅ **Gastos del Mes**
  - Planilla
  - Gastos fijos
  - Total de egresos

- ✅ **Neto del Mes**
  - Ingresos - Egresos
  - Comparativa vs mes anterior

#### 4.2 Visualizaciones
- ✅ Gráfico de pastel: Desglose de ingresos por tipo
- ✅ Tabla: Últimos pagos registrados
- ✅ Tabla destacada: Cuentas por cobrar
- ✅ Indicadores de tendencia

---

### **MÓDULO 5: Hub de Terapeuta**

#### 5.1 Vista "¿Qué vamos a hacer hoy?"
- ✅ **Columna Izquierda: Tareas Pendientes**
  - Formularios de sesión incompletos
  - Priorización por fecha
  - Acceso directo al formulario
  
- ✅ **Columna Derecha: Agenda del Día**
  - Línea de tiempo de sesiones
  - Código de color por modalidad
  - Click para ir a ficha del paciente

#### 5.2 Resumen de Actividades
- ✅ Sesiones completadas hoy
- ✅ Sesiones pendientes
- ✅ Formularios por completar

---

### **MÓDULO 6: Formularios de Sesión Dinámicos**

#### 6.1 Estructura del Formulario

**Secciones Siempre Visibles:**
1. ✅ **I. Información General y Conducta**
   - Asistencia (Presente, Ausente con/sin aviso)
   - Modalidad (En línea, Presencial)
   - Nivel de energía (escala 1-5)
   - Adherencia y participación
   - Independencia en la sesión

2. ✅ **II. Funciones Ejecutivas**
   - Inhibición de conducta
   - Modulación emocional
   - Iniciativa y automonitoreo
   - Flexibilidad cognitiva

**Secciones Condicionales (On-Demand):**

3. ✅ **III. Lectoescritura** (si se selecciona)
   - Métricas de fluidez lectora
   - **Cálculo automático de PPM** (Palabras Por Minuto)
   - Análisis de precisión
   - Observaciones cualitativas

4. ✅ **IV. Matemáticas** (si se selecciona)
   - Objetivos trabajados
   - Nivel de dominio por habilidad
   - Estrategias utilizadas

5. ✅ **V. Terapia Emocional** (si se selecciona)
   - Programa/enfoque (REBT, Growth Mindset, etc.)
   - Temas tratados
   - Emociones exploradas
   - Habilidades practicadas

6. ✅ **VI. Rehabilitación Cognitiva** (si se selecciona)
   - Funciones cognitivas trabajadas
   - Scores de NeuronUP
   - Observaciones conductuales

7. ✅ **VII. Tutorías** (si se selecciona)
   - Descripción libre del enfoque

8. ✅ **VIII. Recomendaciones** (siempre visible)
   - Área académica
   - Apoyo en casa
   - Estrategias terapéuticas

#### 6.2 Características Especiales
- ✅ **Renderizado Condicional:** Secciones aparecen/desaparecen según objetivos
- ✅ **Cálculos Automáticos:** PPM, duración, etc.
- ✅ **Validaciones:** Por sección y globales
- ✅ **Stepper de Navegación:** 4 pasos principales
- ✅ **Guardado Automático:** Merge de datos existentes

---

### **MÓDULO 7: Gestión de Sesiones**

#### 7.1 Lista de Sesiones
- ✅ Vista completa de todas las sesiones
- ✅ Filtros por terapeuta, paciente, fecha
- ✅ Búsqueda por nombre de paciente
- ✅ Indicador de formulario completado
- ✅ Acceso directo al formulario

#### 7.2 Sincronización con Google Calendar
- ✅ **Lectura automática** de eventos de calendarios
- ✅ **5 calendarios sincronizados:**
  - monica@learningmodels.com.gt
  - ximena@learningmodels.com.gt
  - miranda@learningmodels.com.gt
  - fernanda@learningmodels.com.gt
  - mariajimena@learningmodels.com.gt

- ✅ **Identificación de pacientes** vía código en Description
- ✅ **Creación automática** de sesiones en Firestore
- ✅ **Cálculo de duración** en horas
- ✅ **Programación automática:** 12:30 PM y 9:00 PM (L-V)

**Estructura de Sesión:**
```typescript
{
  sessionId: "gcal_[eventId]"
  patientId: string
  therapistId: string
  startTime: Timestamp
  endTime: Timestamp
  duration: number  // horas
  title: string
  location: string
  source: "google_calendar" | "manual"
  calendarId: string
  googleEventId: string
  status: "Scheduled" | "Completed" | "Cancelled"
  formCompleted: boolean
  formData?: SessionFormData
}
```

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

#### **Frontend**
- ✅ **React 18+** con TypeScript
- ✅ **Vite** como build tool
- ✅ **Material-UI (MUI)** para componentes
- ✅ **React Router** para navegación
- ✅ **React Hook Form** para formularios
- ✅ **Firebase SDK** para autenticación y Firestore

#### **Backend**
- ✅ **Firebase Authentication** para usuarios
- ✅ **Cloud Firestore** como base de datos
- ✅ **Cloud Functions** para lógica del servidor
- ✅ **Node.js 18+** con TypeScript
- ✅ **Google Calendar API** para sincronización

#### **Infraestructura**
- ✅ **Firebase Hosting** para frontend
- ✅ **Cloud Functions** (us-central1)
- ✅ **Firestore** en modo nativo
- ✅ **Cloud Scheduler** para tareas programadas

### Integraciones

#### 1. **Google Calendar API**
- ✅ Service Account configurado
- ✅ Domain-Wide Delegation habilitado
- ✅ Scope: `calendar.readonly`
- ✅ Delegación como: monica@learningmodels.com.gt

#### 2. **Google Drive**
- ✅ Picker API para selección de archivos
- ✅ Almacenamiento de links (no archivos)
- ✅ Acceso directo desde registros de pago

### Base de Datos (Firestore)

#### Colecciones Principales

**1. `users`**
```typescript
{
  userId: string (document ID)
  email: string
  name: string
  role: "admin" | "editor" | "therapist"
  isDirector?: boolean
  googleCalendarId?: string
  phone?: string
  startDate?: Date
}
```

**2. `patients`**
```typescript
{
  patientId: string
  firstName: string
  lastName: string
  patientCode: string  // "Nombre_Apellido01"
  dateOfBirth: Date
  grade: string
  school: string
  diagnosis: string
  currentRate: number
  rateHistory: Array<RateHistory>
  // Subcollections: parentTutors, relatedProfessionals
}
```

**3. `sessions`**
```typescript
{
  sessionId: string
  patientId: string
  therapistId: string
  startTime: Timestamp
  endTime: Timestamp
  duration: number
  source: "google_calendar" | "manual"
  status: string
  formCompleted: boolean
  formData?: object
}
```

**4. `payments`**
```typescript
{
  paymentId: string
  patientId: string
  amount: number
  paymentDate: Date
  paymentMethod: string
  driveLink: string
  month: string
  type: string
  installments?: Array
}
```

**5. `expenses`**
```typescript
{
  expenseId: string
  category: string
  amount: number
  date: Date
  description: string
}
```

**6. `payrolls`**
```typescript
{
  payrollId: string
  therapistId: string
  month: string
  hoursWorked: number
  rate: number
  totalAmount: number
}
```

### Security Rules

- ✅ Autenticación requerida para todos los endpoints
- ✅ Permisos basados en roles
- ✅ Validación de `isDirector` para acceso a finanzas
- ✅ Terapeutas solo ven sus pacientes asignados
- ✅ Editores no acceden a planillas

---

## 🎨 Diseño UI/UX

### Filosofía de Diseño
**"Asistente Inteligente y Calmado"**

El sistema debe:
- ✅ Ser limpio y claro (evitar desorden)
- ✅ Ser intuitivo (sin necesidad de manual)
- ✅ Ser eficiente (minimizar clics)

### Tema Visual
- ✅ **Color Primario:** Verde Lima (#CDDC39)
- ✅ **Color Secundario:** Gris oscuro
- ✅ **Tipografía:** Roboto (Material-UI default)
- ✅ **Estilo:** Similar a Google Workspace

### Componentes Clave

#### 1. **Layout Principal**
- ✅ Sidebar izquierdo con navegación
- ✅ Header superior con notificaciones y perfil
- ✅ Contenido principal responsive

#### 2. **Dashboard Cards**
- ✅ KPIs con números grandes y destacados
- ✅ Tendencias con íconos (▲ ▼)
- ✅ Gráficos interactivos

#### 3. **Formularios**
- ✅ Stepper para navegación
- ✅ Validación en tiempo real
- ✅ Mensajes de error claros
- ✅ Autocompletado donde aplica

#### 4. **Tablas**
- ✅ Paginación
- ✅ Ordenamiento por columnas
- ✅ Filtros integrados
- ✅ Acciones rápidas (ver, editar, eliminar)

---

## 📊 Métricas y Analítica

### Métricas Implementadas

#### Financieras
- ✅ Ingresos mensuales (facturado vs cobrado)
- ✅ Cuentas por cobrar
- ✅ Gastos mensuales
- ✅ Neto mensual
- ✅ Desglose por tipo de servicio

#### Operacionales
- ✅ Sesiones programadas vs completadas
- ✅ Formularios completados vs pendientes
- ✅ Horas trabajadas por terapeuta
- ✅ Tasa de asistencia de pacientes

---

## 🚀 Roadmap Futuro

### Fase 2: Asistente de IA (Gemini)
- [ ] Generación automática de reportes mensuales
- [ ] Interfaz tipo chat para interacción
- [ ] Análisis de progreso de pacientes
- [ ] Sugerencias de estrategias terapéuticas

### Fase 3: Sistema de Notificaciones
- [ ] Recordatorios de citas (WhatsApp)
- [ ] Recordatorios de pago automáticos
- [ ] Notificaciones internas
- [ ] Alertas de formularios pendientes

### Fase 4: Reportes Avanzados
- [ ] Gráficos de progreso de pacientes
- [ ] Exportación a PDF/Excel
- [ ] Reportes personalizables
- [ ] Dashboard de análisis predictivo

### Fase 5: Gestión de Planilla
- [ ] Cálculo automático de salarios
- [ ] Basado en horas trabajadas
- [ ] Reportes mensuales
- [ ] Integración con contabilidad

---

## 📝 Notas de Implementación

### Decisiones Técnicas Clave

1. **Firestore sobre SQL**
   - Escalabilidad automática
   - Sincronización en tiempo real
   - Estructura flexible para formularios dinámicos

2. **Material-UI**
   - Acelera desarrollo
   - Componentes probados
   - Look & feel profesional

3. **Cloud Functions**
   - Serverless (sin gestión de servidores)
   - Escalado automático
   - Integración nativa con Firebase

4. **TypeScript**
   - Type safety
   - Mejor DX (Developer Experience)
   - Menos bugs en producción

### Lecciones Aprendidas

1. **Security Rules son críticas**
   - Implementar desde el inicio
   - Probar exhaustivamente
   - Documentar permisos

2. **Formularios dinámicos requieren planificación**
   - React Hook Form es esencial
   - Validaciones por sección
   - Estado compartido complejo

3. **Google Calendar API necesita delegación**
   - Service Account + Domain-Wide Delegation
   - Subject debe ser un usuario con acceso
   - Scopes específicos requeridos

---

## 🎯 Conclusión

Learning Models HUB es una plataforma completa y funcional que:

✅ **Centraliza** toda la gestión del centro de terapias  
✅ **Automatiza** procesos manuales repetitivos  
✅ **Mejora** la eficiencia operativa del equipo  
✅ **Proporciona** visibilidad financiera en tiempo real  
✅ **Facilita** el trabajo de las terapeutas  

**Estado Actual:** Sistema en producción con todas las funcionalidades core implementadas y funcionando.

**Próximos Pasos:** Implementar fases 2-5 del roadmap según prioridades del negocio.

---

**Documento creado:** Octubre 2025  
**Última actualización:** Octubre 2025  
**Versión:** 1.0
