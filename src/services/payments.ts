import api, { handleApiError } from './api';

export interface Payment {
  id: string;
  patientId?: string;
  patientCode: string;
  patientName: string;
  amount: number;
  paymentDate: any;
  paymentMethod: string;
  monthCovered: string;
  type: 'Terapia' | 'Evaluacion' | 'Otro';
  driveLink?: string;
  notes?: string;
  status?: 'Pending' | 'Completed' | 'Cancelled';
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
}

export interface PaymentsResponse {
  success: boolean;
  data: Payment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface PaymentResponse {
  success: boolean;
  data: Payment;
}

// Obtener todos los pagos con paginación y filtros
export const getPayments = async (
  page: number = 1,
  limit: number = 10,
  patientId: string = '',
  status: string = ''
): Promise<PaymentsResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(patientId && { patientId }),
      ...(status && { status })
    });

    const response = await api.get(`/payments?${params}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener un pago por ID
export const getPayment = async (id: string): Promise<PaymentResponse> => {
  try {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Crear un nuevo pago
export const createPayment = async (paymentData: Partial<Payment>): Promise<PaymentResponse> => {
  try {
    const response = await api.post('/payments', paymentData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Actualizar un pago
export const updatePayment = async (id: string, paymentData: Partial<Payment>): Promise<PaymentResponse> => {
  try {
    const response = await api.put(`/payments/${id}`, paymentData);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Eliminar un pago
export const deletePayment = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener pagos de un paciente específico
export const getPatientPayments = async (patientId: string, page: number = 1, limit: number = 50): Promise<PaymentsResponse> => {
  return getPayments(page, limit, patientId);
};

// Obtener todos los pagos (sin paginación) - para compatibilidad
export const getAllPayments = async (): Promise<Payment[]> => {
  try {
    const response = await getPayments(1, 1000);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Helper function para formatear moneda
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ'
  }).format(amount);
};

// Helper function para obtener el mes actual en formato texto
export const getCurrentMonth = (): string => {
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const now = new Date();
  return `${months[now.getMonth()]} ${now.getFullYear()}`;
};

// Alias para compatibilidad
export const getPaymentById = getPayment;
