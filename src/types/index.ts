export interface UserPermissions {
  isAdmin: boolean
  isEditor: boolean
  isTherapist: boolean
  isDirector: boolean
}

export interface User {
  uid: string
  email: string
  name: string
  permissions: UserPermissions
  // Campos legacy para compatibilidad
  role?: 'admin' | 'editor' | 'therapist'
  isDirector?: boolean
}

export interface Patient {
  id: string
  firstName: string
  lastName: string
  age: number
  grade: string
  school: string
  parentContact: {
    name: string
    email: string
    phone: string
  }
  currentRate: number
  rateHistory: RateHistory[]
  paymentExceptions?: {
    canPayLater: boolean
    notes: string
  }
  assignedTherapist?: string
  hourlyRate?: number
  paymentFrequency?: 'weekly' | 'monthly' | 'semanal' | 'mensual'
}

export interface RateHistory {
  rate: number
  startDate: string
  endDate: string | null
}

export interface Therapist {
  id: string
  name: string
  email: string
  role: 'therapist'
  googleCalendarId: string
}

export interface Session {
  id: string
  patientId: string
  therapistId: string
  startTime: Date
  endTime: Date
  status: 'Scheduled' | 'Completed' | 'Cancelled'
  formTemplateId?: string
  formResponses?: Record<string, any>
  notes?: string
}

export interface Payment {
  id: string
  patientId: string
  amount: number
  paymentDate: Date
  paymentMethod: string
  driveLink?: string
  month: string
  type: 'Terapia' | 'Evaluacion' | 'Otro'
}

export interface FormTemplate {
  id: string
  templateName: string
  fields: FormField[]
}

export interface FormField {
  id: string
  label: string
  type: 'text' | 'number' | 'dropdown' | 'checkbox' | 'radio' | 'scale' | 'textarea'
  options?: string[]
  required?: boolean
  section?: string
}

export interface SessionFormData {
  // General Information
  attendance: 'Presente' | 'Ausente con aviso' | 'Ausente sin aviso'
  modality: 'En línea' | 'Presencial'
  energyLevel: number
  adherence: 'Excelente' | 'Buena' | 'Variable' | 'Requiere motivación constante'
  adherenceComments?: string
  technicalDifficulties: boolean
  technicalDifficultiesDescription?: string
  independence: 'Autónomo' | 'Requiere guía mínima' | 'Requiere apoyo constante'
  
  // Executive Functions
  impulseControl: 'Adecuado' | 'Presenta impulsividad ocasional' | 'Dificultad para controlar impulsos'
  followInstructions: 'Inmediatamente' | 'Requiere repetición' | 'Muestra resistencia'
  frustrationManagement: 'Regula sus emociones' | 'Expresa frustración verbalmente' | 'Abandona la tarea' | 'Actitud respetuosa a pesar del reto'
  predominantEmotions: string[]
  taskInitiative: 'Espontánea y proactiva' | 'Requiere orientación para iniciar' | 'Muestra resistencia a tareas difíciles'
  selfMonitoring: 'Identifica y corrige errores de forma autónoma' | 'Identifica pero necesita ayuda para corregir' | 'No percibe sus errores'
  cognitiveFlexibility: 'Flexible y sin dificultad' | 'Muestra resistencia inicial pero se adapta' | 'Se desorganiza con los cambios'
  
  // Session objectives (determines which sections to show)
  sessionObjectives: string[]
  
  // Conditional sections based on objectives
  lectoescritura?: LectoescrituraData
  mathematics?: MathematicsData
  emotionalTherapy?: EmotionalTherapyData
  cognitiveRehabilitation?: CognitiveRehabilitationData
  tutoring?: TutoringData
  
  // Recommendations (always present)
  academicRecommendations: string
  homeSupport: string
  therapeuticStrategies: string
}

export interface LectoescrituraData {
  objectives: string[]
  readingType?: string
  itemsRead?: number
  timeMinutes?: number
  timeSeconds?: number
  wordsPerMinute?: number
  expectedPPM?: number
  accuracy?: number
  omissions?: number
  insertions?: number
  selfCorrections?: number
  incorrectPronunciations?: number
  phonologicalAwareness?: string
  comprehension?: string
  writingSkills?: string[]
  writingObservations?: string
}

export interface MathematicsData {
  objectives: string[]
  skillsWorked: Array<{
    skill: string
    masteryLevel: 'Excelente (independiente)' | 'Bueno (con recordatorios)' | 'En proceso (necesita apoyo constante)'
  }>
  strategiesUsed: string[]
  qualitativeObservations: string
}

export interface EmotionalTherapyData {
  program: 'Terapia Racional Emotiva Conductual (REBT)' | 'Mentalidad de Crecimiento (Growth Mindset)' | 'Regulación emocional' | 'Habilidades sociales'
  situationAddressed: string
  emotionsExplored: string[]
  skillsPracticed: string[]
  patientAttitude: string
  progressObserved: string
}

export interface CognitiveRehabilitationData {
  functionsWorked: string[]
  generalScore?: number
  attentionScore?: number
  memoryScore?: number
  executiveFunctionsScore?: number
  selfEvaluation: 'Optimista (se califica como excelente)' | 'Realista' | 'Negativo'
  persistence: 'Persistente' | 'Se rinde fácilmente' | 'Pide ayuda adecuadamente'
  motorDifficulties: boolean
  motorDifficultiesDescription?: string
  waitsForInstructions: 'Sí' | 'No' | 'A veces'
}

export interface TutoringData {
  sessionFocus: string
}
