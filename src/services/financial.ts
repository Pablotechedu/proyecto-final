import api, { handleApiError } from './api';

export interface Payment {
  id: string;
  patientCode: string;
  patientName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  monthCovered: string;
  type: 'Terapia' | 'Evaluacion' | 'Otro';
  driveLink?: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: string;
}

export interface FinancialSummary {
  totalInvoiced: number;
  totalCollected: number;
  collectionRate: number;
  accountsReceivable: number;
  accountsReceivableList: {
    patientCode: string;
    patientName: string;
    amount: number;
    daysOverdue: number;
  }[];
  totalExpenses: number;
  netIncome: number;
  incomeByType: {
    terapia: number;
    evaluacion: number;
    otro: number;
  };
}

// Obtener todos los pagos con paginación
export const getAllPayments = async (limitCount: number = 50): Promise<Payment[]> => {
  try {
    const response = await api.get(`/payments?limit=${limitCount}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw new Error(handleApiError(error));
  }
};

// Obtener pagos del mes actual
export const getCurrentMonthPayments = async (): Promise<Payment[]> => {
  try {
    const now = new Date();
    const currentMonth = now.toLocaleString('es-GT', { month: 'long', year: 'numeric' });
    
    const response = await api.get(`/payments?monthCovered=${encodeURIComponent(currentMonth)}&limit=1000`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching current month payments:', error);
    throw new Error(handleApiError(error));
  }
};

// Obtener gastos del mes actual
export const getCurrentMonthExpenses = async (): Promise<Expense[]> => {
  try {
    // Por ahora retornamos array vacío ya que no tenemos endpoint de expenses
    // TODO: Crear endpoint /api/expenses en el backend
    return [];
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw new Error(handleApiError(error));
  }
};

// Calcular resumen financiero del mes
export const getFinancialSummary = async (): Promise<FinancialSummary> => {
  try {
    const [payments, expenses] = await Promise.all([
      getCurrentMonthPayments(),
      getCurrentMonthExpenses(),
    ]);

    // Calcular totales
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Calcular ingresos por tipo
    const incomeByType = {
      terapia: payments.filter(p => p.type === 'Terapia').reduce((sum, p) => sum + p.amount, 0),
      evaluacion: payments.filter(p => p.type === 'Evaluacion').reduce((sum, p) => sum + p.amount, 0),
      otro: payments.filter(p => p.type === 'Otro').reduce((sum, p) => sum + p.amount, 0),
    };

    // Por ahora, totalInvoiced = totalCollected (después se calculará con sesiones)
    const totalInvoiced = totalCollected;
    const collectionRate = totalInvoiced > 0 ? (totalCollected / totalInvoiced) * 100 : 0;
    
    // Calcular cuentas por cobrar (simplificado por ahora)
    const accountsReceivable = totalInvoiced - totalCollected;
    
    return {
      totalInvoiced,
      totalCollected,
      collectionRate,
      accountsReceivable,
      accountsReceivableList: [], // Se llenará después con lógica de pacientes
      totalExpenses,
      netIncome: totalCollected - totalExpenses,
      incomeByType,
    };
  } catch (error) {
    console.error('Error calculating financial summary:', error);
    throw error;
  }
};

// Obtener últimos N pagos
export const getRecentPayments = async (limitCount: number = 5): Promise<Payment[]> => {
  try {
    const response = await api.get(`/payments?limit=${limitCount}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching recent payments:', error);
    throw new Error(handleApiError(error));
  }
};

// Obtener pagos de un paciente específico
export const getPatientPayments = async (patientCode: string, limitCount: number = 10): Promise<Payment[]> => {
  try {
    const response = await api.get(`/payments?patientCode=${encodeURIComponent(patientCode)}&limit=${limitCount}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching patient payments:', error);
    throw new Error(handleApiError(error));
  }
};

// Formatear moneda
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(amount);
};

// Calcular tendencia (comparación con mes anterior)
export const calculateTrend = (current: number, previous: number): {
  percentage: number;
  isPositive: boolean;
} => {
  if (previous === 0) {
    return { percentage: 0, isPositive: true };
  }
  
  const percentage = ((current - previous) / previous) * 100;
  return {
    percentage: Math.abs(percentage),
    isPositive: percentage >= 0,
  };
};
