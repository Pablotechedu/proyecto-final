import api, { handleApiError } from './api';

export interface Session {
  id: string;
  patientId: string;
  patientCode?: string;
  patientName?: string;
  therapistId?: string;
  therapistName?: string;
  startTime: any;
  endTime?: any;
  duration?: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';
  sessionType?: string;
  notes?: string;
  objectives?: string[];
  activities?: string[];
  progress?: string;
  homework?: string;
  nextSessionPlan?: string;
  formCompleted?: boolean;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
}

export interface PendingTask {
  id: string;
  title: string;
  description: string;
  patientName: string;
  patientCode: string;
  sessionId?: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: any;
}

export interface SessionsResponse {
  success: boolean;
  data: Session[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface SessionResponse {
  success: boolean;
  data: Session;
}

// Obtener todas las sesiones con paginación y filtros
export const getSessions = async (
  page: number = 1,
  limit: number = 10,
  patientId: string = '',
  status: string = ''
): Promise<SessionsResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(patientId && { patientId }),
      ...(status && { status })
    });

    const response = await api.get(`/sessions?${params}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener una sesión por ID
export const getSession = async (id: string): Promise<SessionResponse> => {
  try {
    const response = await api.get(`/sessions/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Crear una nueva sesión
export const createSession = async (sessionData: Partial<Session>): Promise<SessionResponse> => {
  try {
    const response = await api.post('/sessions', sessionData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar una sesión
export const updateSession = async (id: string, sessionData: Partial<Session>): Promise<SessionResponse> => {
  try {
    const response = await api.put(`/sessions/${id}`, sessionData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar una sesión
export const deleteSession = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/sessions/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener sesiones de un paciente específico
export const getPatientSessions = async (patientId: string, page: number = 1, limit: number = 50): Promise<SessionsResponse> => {
  return getSessions(page, limit, patientId);
};

// Obtener todas las sesiones (sin paginación) - para compatibilidad
export const getAllSessions = async (): Promise<Session[]> => {
  try {
    const response = await getSessions(1, 1000);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Import date helpers
import { 
  toDate, 
  formatTime as formatTimeHelper, 
  calculateDuration as calculateDurationHelper,
  formatDateShort,
  isToday as isTodayHelper,
  startOfDay,
  endOfDay
} from '../utils/dateHelpers';

// Helper function para calcular duración de sesión
export const calculateDuration = (startTime: any, endTime: any): number => {
  return calculateDurationHelper(startTime, endTime);
};

// Helper function para formatear hora
export const formatTime = (timestamp: any): string => {
  return formatTimeHelper(timestamp);
};

// Helper function para formatear fecha corta
export const formatDate = (timestamp: any): string => {
  return formatDateShort(timestamp);
};

// Obtener sesiones de hoy para un terapeuta
export const getTodaySessions = async (therapistId: string): Promise<Session[]> => {
  try {
    const response = await getAllSessions();
    const today = startOfDay();
    const tomorrow = endOfDay();

    return response.filter(session => {
      if (session.therapistId !== therapistId) return false;
      
      const sessionDate = toDate(session.startTime);
      if (!sessionDate) return false;
      
      return sessionDate >= today && sessionDate <= tomorrow;
    });
  } catch (error) {
    console.error('Error getting today sessions:', error);
    return [];
  }
};

// Obtener tareas pendientes para un terapeuta
export const getPendingTasks = async (therapistId: string): Promise<PendingTask[]> => {
  try {
    const response = await getAllSessions();
    const tasks: PendingTask[] = [];

    response.forEach(session => {
      if (session.therapistId !== therapistId) return;
      
      // Tarea: Sesión completada sin formulario
      if (session.status === 'Completed' && !session.formCompleted) {
        const dateStr = formatDateShort(session.startTime);

        tasks.push({
          id: `form-${session.id}`,
          title: 'Completar formulario de sesión',
          description: `Sesión del ${dateStr}`,
          patientName: session.patientName || 'Paciente',
          patientCode: session.patientCode || '',
          sessionId: session.id,
          priority: 'high',
          dueDate: session.startTime
        });
      }
    });

    // Ordenar por prioridad y fecha
    return tasks.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return 0;
    });
  } catch (error) {
    console.error('Error getting pending tasks:', error);
    return [];
  }
};

// Alias para compatibilidad
export const getSessionById = getSession;
