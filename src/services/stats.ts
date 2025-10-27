import api, { handleApiError } from './api';

export interface DashboardStats {
  patients: {
    total: number;
    active: number;
    inactive: number;
  };
  sessions: {
    total: number;
    completed: number;
    scheduled: number;
    cancelled: number;
    thisMonth: number;
  };
  payments: {
    total: number;
    completed: number;
    pending: number;
    totalRevenue: number;
    revenueThisMonth: number;
  };
}

export interface MonthlyData {
  month: number;
  monthName: string;
  count?: number;
  revenue?: number;
}

export interface TopPatient {
  patientId: string;
  patientName: string;
  sessionCount: number;
}

// Obtener estadísticas del dashboard
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get('/stats/dashboard');
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener sesiones por mes
export const getSessionsByMonth = async (year?: number): Promise<MonthlyData[]> => {
  try {
    const params = year ? `?year=${year}` : '';
    const response = await api.get(`/stats/sessions-by-month${params}`);
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener ingresos por mes
export const getRevenueByMonth = async (year?: number): Promise<MonthlyData[]> => {
  try {
    const params = year ? `?year=${year}` : '';
    const response = await api.get(`/stats/revenue-by-month${params}`);
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Obtener top pacientes
export const getTopPatients = async (limit: number = 10): Promise<TopPatient[]> => {
  try {
    const response = await api.get(`/stats/top-patients?limit=${limit}`);
    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
