/**
 * Utilidades para manejo de fechas con Firestore
 */

/**
 * Convierte un Timestamp de Firestore o string a objeto Date
 */
export const toDate = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  
  try {
    // Si es un Timestamp de Firestore
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    
    // Si es un objeto con seconds (formato Firestore serializado)
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    
    // Si es un objeto con _seconds (formato alternativo de Firestore)
    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000);
    }
    
    // Si es un string o número
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    return null;
  } catch (error) {
    console.error('Error converting timestamp to date:', error);
    return null;
  }
};

/**
 * Formatea una fecha para mostrar en formato local
 */
export const formatDate = (timestamp: any, locale: string = 'es-GT'): string => {
  const date = toDate(timestamp);
  if (!date) return 'Fecha inválida';
  
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Formatea una fecha en formato corto (DD/MM/YYYY)
 */
export const formatDateShort = (timestamp: any, locale: string = 'es-GT'): string => {
  const date = toDate(timestamp);
  if (!date) return 'N/A';
  
  return date.toLocaleDateString(locale);
};

/**
 * Formatea una hora
 */
export const formatTime = (timestamp: any, locale: string = 'es-GT'): string => {
  const date = toDate(timestamp);
  if (!date) return 'N/A';
  
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Formatea fecha y hora completa
 */
export const formatDateTime = (timestamp: any, locale: string = 'es-GT'): string => {
  const date = toDate(timestamp);
  if (!date) return 'N/A';
  
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Convierte una fecha a string ISO para inputs de tipo date
 */
export const toInputDateString = (timestamp: any): string => {
  const date = toDate(timestamp);
  if (!date) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Convierte una fecha a string para inputs de tipo datetime-local
 */
export const toInputDateTimeString = (timestamp: any): string => {
  const date = toDate(timestamp);
  if (!date) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Verifica si una fecha es válida
 */
export const isValidDate = (timestamp: any): boolean => {
  const date = toDate(timestamp);
  return date !== null && !isNaN(date.getTime());
};

/**
 * Calcula la duración entre dos fechas en minutos
 */
export const calculateDuration = (startTime: any, endTime: any): number => {
  const start = toDate(startTime);
  const end = toDate(endTime);
  
  if (!start || !end) return 0;
  
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / 60000);
};

/**
 * Verifica si una fecha es hoy
 */
export const isToday = (timestamp: any): boolean => {
  const date = toDate(timestamp);
  if (!date) return false;
  
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

/**
 * Obtiene el inicio del día
 */
export const startOfDay = (date: Date = new Date()): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

/**
 * Obtiene el fin del día
 */
export const endOfDay = (date: Date = new Date()): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};
