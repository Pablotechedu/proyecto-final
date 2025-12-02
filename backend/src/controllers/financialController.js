const { db } = require('../config/firebase');

/**
 * Obtener resumen financiero del mes actual
 * GET /api/financial/summary
 */
exports.getFinancialSummary = async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 0-indexed
    const monthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    
    // Obtener todos los pagos del mes actual
    const paymentsRef = db.collection('payments');
    const paymentsSnapshot = await paymentsRef
      .where('monthCovered', '==', monthKey)
      .get();
    
    let totalCollected = 0;
    const incomeByType = {
      terapia: 0,
      evaluacion: 0,
      otro: 0
    };
    
    paymentsSnapshot.forEach(doc => {
      const payment = doc.data();
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
