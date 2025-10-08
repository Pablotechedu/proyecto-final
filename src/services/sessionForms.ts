import { 
  collection, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit as firestoreLimit,
} from 'firebase/firestore';
import { db } from './firebase';
import { SessionFormData } from '../types';

// Crear nueva sesión con formulario
export const createSessionForm = async (
  sessionId: string,
  formData: SessionFormData
): Promise<void> => {
  try {
    const sessionRef = doc(db, 'sessions', sessionId);
    
    // Limpiar datos undefined
    const cleanData: any = {
      formCompleted: true,
      formData: {},
      updatedAt: new Date().toISOString(),
    };
    
    // Solo agregar campos con valor
    Object.keys(formData).forEach(key => {
      const value = (formData as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        cleanData.formData[key] = value;
      }
    });
    
    await updateDoc(sessionRef, cleanData);
  } catch (error) {
    console.error('Error creating session form:', error);
    throw error;
  }
};

// Obtener formulario de sesión
export const getSessionForm = async (sessionId: string): Promise<SessionFormData | null> => {
  try {
    const sessionRef = doc(db, 'sessions', sessionId);
    const snapshot = await getDoc(sessionRef);
    
    if (snapshot.exists() && snapshot.data().formData) {
      return snapshot.data().formData as SessionFormData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching session form:', error);
    throw error;
  }
};

// Calcular Palabras Por Minuto (PPM)
export const calculatePPM = (itemsRead: number, minutes: number, seconds: number): number => {
  const totalMinutes = minutes + (seconds / 60);
  if (totalMinutes === 0) return 0;
  return Math.round(itemsRead / totalMinutes);
};

// Calcular tiempo en formato MM:SS
export const formatTime = (minutes: number, seconds: number): string => {
  const m = Math.floor(minutes);
  const s = Math.floor(seconds);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// Validar sección de lectoescritura
export const validateLectoescritura = (data: any): string[] => {
  const errors: string[] = [];
  
  if (data.itemsRead && !data.timeMinutes && !data.timeSeconds) {
    errors.push('Debes ingresar el tiempo de lectura');
  }
  
  if ((data.timeMinutes || data.timeSeconds) && !data.itemsRead) {
    errors.push('Debes ingresar la cantidad de items leídos');
  }
  
  return errors;
};

// Validar sección de matemáticas
export const validateMathematics = (data: any): string[] => {
  const errors: string[] = [];
  
  if (data.skillsWorked && data.skillsWorked.length === 0) {
    errors.push('Debes agregar al menos una habilidad trabajada');
  }
  
  return errors;
};

// Validar sección de terapia emocional
export const validateEmotionalTherapy = (data: any): string[] => {
  const errors: string[] = [];
  
  if (!data.program) {
    errors.push('Debes seleccionar un programa');
  }
  
  if (!data.situationAddressed) {
    errors.push('Debes describir la situación abordada');
  }
  
  return errors;
};

// Obtener objetivos disponibles
export const getAvailableObjectives = (): string[] => {
  return [
    'Lectoescritura',
    'Matemáticas',
    'Terapia Emocional',
    'Rehabilitación Cognitiva',
    'Tutorías',
  ];
};

// Obtener emociones disponibles
export const getAvailableEmotions = (): string[] => {
  return [
    'Entusiasmo',
    'Curiosidad',
    'Cansancio',
    'Aburrimiento',
    'Apatía',
    'Ansiedad',
    'Nerviosismo',
    'Miedo',
    'Frustración',
    'Tristeza',
  ];
};

// Obtener habilidades de escritura
export const getWritingSkills = (): string[] => {
  return [
    'Organización de ideas',
    'Uso de conectores',
    'Puntuación',
    'Precisión en palabras CVC',
    'Estructura de párrafos',
  ];
};

// Obtener estrategias matemáticas
export const getMathStrategies = (): string[] => {
  return [
    'Cálculo mental',
    'Apoyos visuales (ábaco, dibujos)',
    'Conteo con los dedos',
    'Tally marks',
  ];
};

// Obtener funciones cognitivas
export const getCognitiveFunctions = (): string[] => {
  return [
    'Atención',
    'Memoria',
    'Lenguaje',
    'Funciones Ejecutivas',
    'Gnosias',
    'Praxias',
    'Cognición Social',
  ];
};

// Obtener habilidades de terapia emocional
export const getEmotionalSkills = (): string[] => {
  return [
    'Comunicación asertiva',
    'Identificación de pensamientos irracionales',
    'Reestructuración cognitiva',
    'Role-playing',
    'Gratitud',
  ];
};
