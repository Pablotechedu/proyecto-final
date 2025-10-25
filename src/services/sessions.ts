import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface Session {
  id: string;
  patientId?: string;
  patientCode: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  startTime: string;
  endTime: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'NoShow';
  sessionType: string;
  notes?: string;
  formCompleted: boolean;
}

export interface PendingTask {
  id: string;
  type: 'session-form' | 'report' | 'other';
  title: string;
  description: string;
  patientCode: string;
  patientName: string;
  sessionId?: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

// Obtener sesiones del día para un terapeuta
export const getTodaySessions = async (therapistId: string): Promise<Session[]> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessionsRef = collection(db, 'sessions');
    const q = query(
      sessionsRef,
      where('therapistId', '==', therapistId),
      where('startTime', '>=', Timestamp.fromDate(today)),
      where('startTime', '<', Timestamp.fromDate(tomorrow)),
      orderBy('startTime', 'asc')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        patientId: data.patientId,
        patientCode: data.patientCode,
        patientName: data.patientName,
        therapistId: data.therapistId,
        therapistName: data.therapistName,
        startTime: data.startTime?.toDate?.()?.toISOString() || data.startTime,
        endTime: data.endTime?.toDate?.()?.toISOString() || data.endTime,
        status: data.status,
        sessionType: data.sessionType || 'Terapia',
        notes: data.notes || '',
        formCompleted: data.formCompleted || false,
      } as Session;
    });
  } catch (error) {
    console.error('Error fetching today sessions:', error);
    throw error;
  }
};

// Obtener próximas sesiones de un terapeuta
export const getUpcomingSessions = async (
  therapistId: string,
  limitCount: number = 10
): Promise<Session[]> => {
  try {
    const now = new Date();
    
    const sessionsRef = collection(db, 'sessions');
    const q = query(
      sessionsRef,
      where('therapistId', '==', therapistId),
      where('startTime', '>=', Timestamp.fromDate(now)),
      orderBy('startTime', 'asc'),
      firestoreLimit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        patientCode: data.patientCode,
        patientName: data.patientName,
        therapistId: data.therapistId,
        therapistName: data.therapistName,
        startTime: data.startTime?.toDate?.()?.toISOString() || data.startTime,
        endTime: data.endTime?.toDate?.()?.toISOString() || data.endTime,
        status: data.status,
        sessionType: data.sessionType || 'Terapia',
        notes: data.notes || '',
        formCompleted: data.formCompleted || false,
      } as Session;
    });
  } catch (error) {
    console.error('Error fetching upcoming sessions:', error);
    throw error;
  }
};

// Obtener tareas pendientes de un terapeuta
export const getPendingTasks = async (therapistId: string): Promise<PendingTask[]> => {
  try {
    // Obtener sesiones completadas sin formulario
    const sessionsRef = collection(db, 'sessions');
    const q = query(
      sessionsRef,
      where('therapistId', '==', therapistId),
      where('status', '==', 'Completed'),
      where('formCompleted', '==', false),
      orderBy('startTime', 'desc'),
      firestoreLimit(10)
    );
    
    const snapshot = await getDocs(q);
    
    const tasks: PendingTask[] = snapshot.docs.map(doc => {
      const session = doc.data() as Session;
      const sessionDate = new Date(session.startTime);
      const daysSince = Math.floor((Date.now() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: doc.id,
        type: 'session-form',
        title: 'Completar formulario de sesión',
        description: `Sesión del ${sessionDate.toLocaleDateString('es-GT')}`,
        patientCode: session.patientCode,
        patientName: session.patientName,
        sessionId: doc.id,
        dueDate: session.startTime,
        priority: daysSince > 2 ? 'high' : daysSince > 0 ? 'medium' : 'low',
      };
    });
    
    return tasks;
  } catch (error) {
    console.error('Error fetching pending tasks:', error);
    throw error;
  }
};

// Marcar sesión como completada
export const markSessionAsCompleted = async (sessionId: string): Promise<void> => {
  try {
    const sessionRef = doc(db, 'sessions', sessionId);
    await updateDoc(sessionRef, {
      status: 'Completed',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error marking session as completed:', error);
    throw error;
  }
};

// Obtener sesiones de un paciente
export const getPatientSessions = async (
  patientCode: string,
  limitCount: number = 20
): Promise<Session[]> => {
  try {
    const sessionsRef = collection(db, 'sessions');
    const q = query(
      sessionsRef,
      where('patientCode', '==', patientCode),
      orderBy('startTime', 'desc'),
      firestoreLimit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Session));
  } catch (error) {
    console.error('Error fetching patient sessions:', error);
    throw error;
  }
};

// Formatear hora
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-GT', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

// Formatear fecha
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-GT', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Calcular duración de sesión en minutos
export const calculateDuration = (startTime: string, endTime: string): number => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
};

// Verificar si una sesión es hoy
export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

// Verificar si una sesión ya pasó
export const isPast = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  return date < now;
};
