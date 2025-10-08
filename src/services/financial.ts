import { collection, getDocs, query, where, orderBy, limit as firestoreLimit, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

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
    const paymentsRef = collection(db, 'payments');
    const q = query(
      paymentsRef,
      orderBy('paymentDate', 'desc'),
      firestoreLimit(limitCount)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Payment));
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

// Obtener pagos del mes actual (usa índice compuesto)
export const getCurrentMonthPayments = async (): Promise<Payment[]> => {
  try {
    const now = new Date();
    const currentMonth = now.toLocaleString('es-GT', { month: 'long', year: 'numeric' });
    
    const paymentsRef = collection(db, 'payments');
    const q = query(
      paymentsRef,
      where('monthCovered', '==', currentMonth),
      orderBy('paymentDate', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Payment));
  } catch (error) {
    console.error('Error fetching current month payments:', error);
    throw error;
  }
};

// Obtener gastos del mes actual
export const getCurrentMonthExpenses = async (): Promise<Expense[]> => {
  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const expensesRef = collection(db, 'expenses');
    const snapshot = await getDocs(expensesRef);
    
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Expense))
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= firstDay && expenseDate <= lastDay;
      });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
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

// Obtener últimos N pagos (usa índice simple)
export const getRecentPayments = async (limitCount: number = 5): Promise<Payment[]> => {
  try {
    const paymentsRef = collection(db, 'payments');
    const q = query(
      paymentsRef,
      orderBy('paymentDate', 'desc'),
      firestoreLimit(limitCount)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Payment));
  } catch (error) {
    console.error('Error fetching recent payments:', error);
    throw error;
  }
};

// Obtener pagos de un paciente específico
export const getPatientPayments = async (patientCode: string, limitCount: number = 10): Promise<Payment[]> => {
  try {
    const paymentsRef = collection(db, 'payments');
    const q = query(
      paymentsRef,
      where('patientCode', '==', patientCode),
      orderBy('paymentDate', 'desc'),
      firestoreLimit(limitCount)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Payment));
  } catch (error) {
    console.error('Error fetching patient payments:', error);
    throw error;
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
