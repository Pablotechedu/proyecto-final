import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  Timestamp 
} from 'firebase/firestore';
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
  notes?: string;
}

export interface Evaluation {
  id: string;
  patientCode: string;
  patientName: string;
  totalAmount: number;
  installments: {
    installmentNumber: number;
    amount: number;
    dueDate: string;
    paid: boolean;
    paymentId?: string;
  }[];
  createdDate: string;
  status: 'pending' | 'partial' | 'completed';
}

// CRUD de Pagos

// Crear nuevo pago
export const createPayment = async (paymentData: Omit<Payment, 'id'>): Promise<string> => {
  try {
    const paymentsRef = collection(db, 'payments');
    
    // Crear objeto limpio sin valores undefined
    const cleanData: any = {
      createdAt: new Date().toISOString(),
    };
    
    // Solo agregar campos que tengan valor definido
    Object.keys(paymentData).forEach(key => {
      const value = (paymentData as any)[key];
      if (value !== undefined && value !== null) {
        cleanData[key] = value;
      }
    });
    
    const docRef = await addDoc(paymentsRef, cleanData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

// Obtener pago por ID
export const getPaymentById = async (paymentId: string): Promise<Payment | null> => {
  try {
    const paymentRef = doc(db, 'payments', paymentId);
    const snapshot = await getDoc(paymentRef);
    
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as Payment;
    }
    return null;
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw error;
  }
};

// Actualizar pago
export const updatePayment = async (
  paymentId: string,
  paymentData: Partial<Payment>
): Promise<void> => {
  try {
    const paymentRef = doc(db, 'payments', paymentId);
    
    // Crear objeto limpio sin valores undefined
    const cleanData: any = {
      updatedAt: new Date().toISOString(),
    };
    
    // Solo agregar campos que tengan valor definido
    Object.keys(paymentData).forEach(key => {
      const value = (paymentData as any)[key];
      if (value !== undefined && value !== null) {
        cleanData[key] = value;
      }
    });
    
    await updateDoc(paymentRef, cleanData);
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
};

// Eliminar pago
export const deletePayment = async (paymentId: string): Promise<void> => {
  try {
    const paymentRef = doc(db, 'payments', paymentId);
    await deleteDoc(paymentRef);
  } catch (error) {
    console.error('Error deleting payment:', error);
    throw error;
  }
};

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

// Obtener pagos de un paciente
export const getPatientPayments = async (
  patientCode: string,
  limitCount: number = 20
): Promise<Payment[]> => {
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

// Obtener pagos del mes actual
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

// CRUD de Evaluaciones

// Crear evaluación con cuotas
export const createEvaluation = async (
  evaluationData: Omit<Evaluation, 'id'>
): Promise<string> => {
  try {
    const evaluationsRef = collection(db, 'evaluations');
    const docRef = await addDoc(evaluationsRef, {
      ...evaluationData,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating evaluation:', error);
    throw error;
  }
};

// Obtener evaluación por ID
export const getEvaluationById = async (evaluationId: string): Promise<Evaluation | null> => {
  try {
    const evaluationRef = doc(db, 'evaluations', evaluationId);
    const snapshot = await getDoc(evaluationRef);
    
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as Evaluation;
    }
    return null;
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    throw error;
  }
};

// Obtener evaluaciones de un paciente
export const getPatientEvaluations = async (patientCode: string): Promise<Evaluation[]> => {
  try {
    const evaluationsRef = collection(db, 'evaluations');
    const q = query(
      evaluationsRef,
      where('patientCode', '==', patientCode),
      orderBy('createdDate', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Evaluation));
  } catch (error) {
    console.error('Error fetching patient evaluations:', error);
    throw error;
  }
};

// Marcar cuota como pagada
export const markInstallmentAsPaid = async (
  evaluationId: string,
  installmentNumber: number,
  paymentId: string
): Promise<void> => {
  try {
    const evaluation = await getEvaluationById(evaluationId);
    if (!evaluation) throw new Error('Evaluation not found');

    const updatedInstallments = evaluation.installments.map(inst => 
      inst.installmentNumber === installmentNumber
        ? { ...inst, paid: true, paymentId }
        : inst
    );

    const paidCount = updatedInstallments.filter(inst => inst.paid).length;
    const status = paidCount === 0 ? 'pending' 
      : paidCount === updatedInstallments.length ? 'completed' 
      : 'partial';

    const evaluationRef = doc(db, 'evaluations', evaluationId);
    await updateDoc(evaluationRef, {
      installments: updatedInstallments,
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error marking installment as paid:', error);
    throw error;
  }
};

// Calcular cuotas sugeridas
export const calculateInstallments = (
  totalAmount: number,
  numberOfInstallments: number = 3
): number[] => {
  const installmentAmount = Math.round((totalAmount / numberOfInstallments) * 100) / 100;
  const installments = Array(numberOfInstallments).fill(installmentAmount);
  
  // Ajustar la última cuota para que sume exactamente el total
  const sum = installments.reduce((a, b) => a + b, 0);
  const difference = Math.round((totalAmount - sum) * 100) / 100;
  installments[installments.length - 1] += difference;
  
  return installments;
};

// Formatear moneda
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(amount);
};

// Obtener mes actual en formato español
export const getCurrentMonth = (): string => {
  const now = new Date();
  return now.toLocaleString('es-GT', { month: 'long', year: 'numeric' });
};

// Generar fechas de vencimiento para cuotas
export const generateDueDates = (
  startDate: Date,
  numberOfInstallments: number
): string[] => {
  const dueDates: string[] = [];
  
  for (let i = 0; i < numberOfInstallments; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    dueDates.push(dueDate.toISOString().split('T')[0]);
  }
  
  return dueDates;
};
