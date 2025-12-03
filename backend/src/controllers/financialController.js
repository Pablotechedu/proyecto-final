import {  db  } from '../config/firebase.js';

/**
 * Obtener resumen financiero del mes actual o especificado
 * GET /api/financial/summary?month=12&year=2025
 */
export const getFinancialSummary = async (req, res) => {
  try {
    // Obtener mes y año de los query params, o usar el actual
    const { month, year } = req.query;
    const now = new Date();
    const selectedYear = year ? parseInt(year) : now.getFullYear();
    const selectedMonth = month ? parseInt(month) - 1 : now.getMonth(); // 0-11
    
    // Obtener todos los pagos
    const paymentsRef = db.collection('payments');
    const paymentsSnapshot = await paymentsRef.get();
    
    let totalCollected = 0;
    const incomeByType = {
      terapia: 0,
      evaluacion: 0,
      otro: 0
    };
    
    paymentsSnapshot.forEach(doc => {
      const payment = doc.data();
      
      // Filtrar por fecha y estado
      const paymentDate = payment.paymentDate?.toDate?.() || new Date(payment.paymentDate);
      const paymentMonth = paymentDate.getUTCMonth();
      const paymentYear = paymentDate.getUTCFullYear();
      
      // Solo contar pagos completados del mes seleccionado
      if (paymentYear === selectedYear && 
          paymentMonth === selectedMonth &&
          payment.status === 'Completed') {
        
        const amount = payment.amount || 0;
        totalCollected += amount;
        
        // Clasificar por tipo
        const type = (payment.type || 'Otro').toLowerCase();
        if (type === 'terapia') {
          incomeByType.terapia += amount;
        } else if (type === 'evaluacion') {
          incomeByType.evaluacion += amount;
        } else {
          incomeByType.otro += amount;
        }
      }
    });
    
    // Por ahora, gastos = 0 (no tenemos colección de gastos)
    const totalExpenses = 0;
    const netIncome = totalCollected - totalExpenses;
    
    // Calcular cuentas por cobrar (simplificado)
    // TODO: Implementar lógica real de cuentas por cobrar
    const accountsReceivable = 0;
    const accountsReceivableList = [];
    
    const summary = {
      totalInvoiced: totalCollected, // Por ahora igual a collected
      totalCollected,
      collectionRate: 100, // Por ahora 100%
      accountsReceivable,
      accountsReceivableList,
      totalExpenses,
      netIncome,
      incomeByType
    };
    
    res.json({
      success: true,
      data: summary
    });
    
  } catch (error) {
    console.error('Error en getFinancialSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen financiero',
      error: error.message
    });
  }
};
