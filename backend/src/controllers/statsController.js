import {  db  } from '../config/firebase.js';

/**
 * @desc    Obtener estadísticas generales del dashboard
 * @route   GET /api/stats/dashboard
 * @access  Private (admin, editor)
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Obtener mes y año de los query params, o usar el actual
    const { month, year } = req.query;
    const now = new Date();
    const selectedYear = year ? parseInt(year) : now.getFullYear();
    const selectedMonth = month ? parseInt(month) - 1 : now.getMonth(); // 0-11
    
    // Obtener totales
    const [patientsSnapshot, sessionsSnapshot, paymentsSnapshot] = await Promise.all([
      db.collection('patients').get(),
      db.collection('sessions').get(),
      db.collection('payments').get()
    ]);

    // Contar pacientes activos/inactivos
    let activePatients = 0;
    let inactivePatients = 0;
    patientsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.status === 'active') {
        activePatients++;
      } else {
        inactivePatients++;
      }
    });

    // Contar sesiones por estado
    let completedSessions = 0;
    let scheduledSessions = 0;
    let cancelledSessions = 0;
    sessionsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.status === 'Completed') completedSessions++;
      else if (data.status === 'Scheduled') scheduledSessions++;
      else if (data.status === 'Cancelled') cancelledSessions++;
    });

    // Calcular ingresos totales (solo pagos completados)
    let totalRevenue = 0;
    let pendingPayments = 0;
    let completedPayments = 0;
    paymentsSnapshot.forEach(doc => {
      const data = doc.data();
      const amount = parseFloat(data.amount) || 0;
      
      if (data.status === 'pending') {
        pendingPayments++;
      } else if (data.status === 'completed') {
        completedPayments++;
        totalRevenue += amount;
      }
    });

    // Estadísticas del mes seleccionado
    let sessionsThisMonth = 0;
    let revenueThisMonth = 0;
    
    sessionsSnapshot.forEach(doc => {
      const data = doc.data();
      const sessionDate = data.startTime?.toDate?.() || new Date(data.startTime);
      
      // Comparar solo año y mes, ignorando hora
      if (sessionDate.getFullYear() === selectedYear && 
          sessionDate.getMonth() === selectedMonth) {
        sessionsThisMonth++;
      }
    });

    paymentsSnapshot.forEach(doc => {
      const data = doc.data();
      const paymentDate = data.paymentDate?.toDate?.() || new Date(data.paymentDate);
      
      // Usar UTC month para pagos que vienen con hora fija (12:00 UTC)
      const paymentMonth = paymentDate.getUTCMonth();
      const paymentYear = paymentDate.getUTCFullYear();
      
      // Solo sumar pagos completados del mes seleccionado
      if (paymentYear === selectedYear && 
          paymentMonth === selectedMonth &&
          data.status === 'Completed') {
        revenueThisMonth += parseFloat(data.amount) || 0;
      }
    });

    res.json({
      success: true,
      data: {
        patients: {
          total: patientsSnapshot.size,
          active: activePatients,
          inactive: inactivePatients
        },
        sessions: {
          total: sessionsSnapshot.size,
          completed: completedSessions,
          scheduled: scheduledSessions,
          cancelled: cancelledSessions,
          thisMonth: sessionsThisMonth
        },
        payments: {
          total: paymentsSnapshot.size,
          completed: completedPayments,
          pending: pendingPayments,
          totalRevenue: totalRevenue,
          revenueThisMonth: revenueThisMonth
        }
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener estadísticas de sesiones por mes
 * @route   GET /api/stats/sessions-by-month
 * @access  Private (admin, editor)
 */
export const getSessionsByMonth = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const snapshot = await db.collection('sessions').get();
    
    // Inicializar contadores por mes
    const monthlyData = Array(12).fill(0).map((_, index) => ({
      month: index + 1,
      monthName: new Date(year, index).toLocaleString('es', { month: 'long' }),
      count: 0
    }));

    snapshot.forEach(doc => {
      const data = doc.data();
      const sessionDate = data.startTime?.toDate?.() || new Date(data.startTime);
      
      if (sessionDate.getFullYear() === parseInt(year)) {
        const month = sessionDate.getMonth();
        monthlyData[month].count++;
      }
    });

    res.json({
      success: true,
      data: monthlyData
    });
  } catch (error) {
    console.error('Error getting sessions by month:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de sesiones',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener estadísticas de ingresos por mes
 * @route   GET /api/stats/revenue-by-month
 * @access  Private (admin, editor)
 */
export const getRevenueByMonth = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const snapshot = await db.collection('payments').get();
    
    // Inicializar contadores por mes
    const monthlyData = Array(12).fill(0).map((_, index) => ({
      month: index + 1,
      monthName: new Date(year, index).toLocaleString('es', { month: 'long' }),
      revenue: 0
    }));

    snapshot.forEach(doc => {
      const data = doc.data();
      const paymentDate = data.paymentDate?.toDate?.() || new Date(data.paymentDate);
      
      // Solo sumar pagos completados
      if (paymentDate.getFullYear() === parseInt(year) && 
          data.status === 'completed') {
        const month = paymentDate.getMonth();
        monthlyData[month].revenue += parseFloat(data.amount) || 0;
      }
    });

    res.json({
      success: true,
      data: monthlyData
    });
  } catch (error) {
    console.error('Error getting revenue by month:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de ingresos',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener top pacientes por número de sesiones
 * @route   GET /api/stats/top-patients
 * @access  Private (admin, editor)
 */
export const getTopPatients = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const snapshot = await db.collection('sessions').get();
    
    // Contar sesiones por paciente
    const patientSessions = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const patientId = data.patientId;
      const patientName = data.patientName || 'Desconocido';
      
      if (!patientSessions[patientId]) {
        patientSessions[patientId] = {
          patientId,
          patientName,
          sessionCount: 0
        };
      }
      patientSessions[patientId].sessionCount++;
    });

    // Convertir a array y ordenar
    const topPatients = Object.values(patientSessions)
      .sort((a, b) => b.sessionCount - a.sessionCount)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: topPatients
    });
  } catch (error) {
    console.error('Error getting top patients:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener top pacientes',
      error: error.message
    });
  }
};
