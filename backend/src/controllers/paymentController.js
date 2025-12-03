import {  db  } from '../config/firebase.js';
import {  paginate  } from '../utils/pagination.js';

// @desc    Obtener todos los pagos
// @route   GET /api/payments
// @access  Private
export const getPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, patientId = '', patientCode = '', status = '', monthCovered = '' } = req.query;

    let query = db.collection('payments');

    // Filtrar por paciente si se proporciona
    if (patientId) {
      query = query.where('patientId', '==', patientId);
    }

    // Filtrar por código de paciente si se proporciona
    if (patientCode) {
      query = query.where('patientCode', '==', patientCode);
    }

    // Filtrar por estado si se proporciona
    if (status) {
      query = query.where('status', '==', status);
    }

    // Filtrar por mes cubierto si se proporciona
    if (monthCovered) {
      query = query.where('monthCovered', '==', monthCovered);
    }

    // Obtener todos los documentos
    const snapshot = await query.get();
    let payments = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      payments.push({
        id: doc.id,
        ...data,
        // Convertir Timestamps de Firebase a formato ISO string
        paymentDate: data.paymentDate?.toDate?.()?.toISOString() || data.paymentDate,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      });
    });

    // Ordenar por fecha (más recientes primero)
    payments.sort((a, b) => {
      const dateA = a.paymentDate?.toDate?.() || new Date(a.paymentDate || 0);
      const dateB = b.paymentDate?.toDate?.() || new Date(b.paymentDate || 0);
      return dateB - dateA;
    });

    // Paginar resultados
    const paginatedData = paginate(payments, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      data: paginatedData.data,
      pagination: paginatedData.pagination
    });
  } catch (error) {
    console.error('Error getting payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pagos',
      error: error.message
    });
  }
};

// @desc    Obtener un pago por ID
// @route   GET /api/payments/:id
// @access  Private
export const getPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection('payments').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    const data = doc.data();
    const payment = {
      id: doc.id,
      ...data,
      // Convertir Timestamps de Firebase a formato ISO string
      paymentDate: data.paymentDate?.toDate?.()?.toISOString() || data.paymentDate,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
    };

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error getting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pago',
      error: error.message
    });
  }
};

// @desc    Crear un nuevo pago
// @route   POST /api/payments
// @access  Private
export const createPayment = async (req, res) => {
  try {
    // Convertir fecha ISO string a Date object
    // Si viene solo la fecha (YYYY-MM-DD), agregarle mediodía para evitar problemas de zona horaria
    let paymentDate;
    if (req.body.paymentDate) {
      const dateStr = req.body.paymentDate;
      // Si es solo fecha (YYYY-MM-DD), agregar hora de mediodía
      if (dateStr.length === 10 && !dateStr.includes('T')) {
        paymentDate = new Date(dateStr + 'T12:00:00.000Z');
      } else {
        paymentDate = new Date(dateStr);
      }
    } else {
      paymentDate = new Date();
    }
    
    const paymentData = {
      ...req.body,
      paymentDate,
      status: req.body.status || 'Completed', // Default status to 'Completed'
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.id
    };

    const docRef = await db.collection('payments').add(paymentData);

    res.status(201).json({
      success: true,
      message: 'Pago registrado exitosamente',
      data: {
        id: docRef.id,
        ...paymentData
      }
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar pago',
      error: error.message
    });
  }
};

// @desc    Actualizar un pago
// @route   PUT /api/payments/:id
// @access  Private
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection('payments').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    // Preparar datos de actualización
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
      updatedBy: req.user.id
    };

    // Convertir fecha ISO string a Date object si existe
    if (req.body.paymentDate) {
      const dateStr = req.body.paymentDate;
      // Si es solo fecha (YYYY-MM-DD), agregar hora de mediodía
      if (dateStr.length === 10 && !dateStr.includes('T')) {
        updateData.paymentDate = new Date(dateStr + 'T12:00:00.000Z');
      } else {
        updateData.paymentDate = new Date(dateStr);
      }
    }

    // Asegurar que status existe (mantener el actual si no se proporciona)
    if (!updateData.status) {
      const currentData = doc.data();
      updateData.status = currentData.status || 'Completed';
    }

    await db.collection('payments').doc(id).update(updateData);

    // Obtener datos actualizados
    const updatedDoc = await db.collection('payments').doc(id).get();
    const updatedData = updatedDoc.data();

    res.json({
      success: true,
      message: 'Pago actualizado exitosamente',
      data: {
        id,
        ...updatedData,
        // Convertir Timestamps de Firebase a formato ISO string
        paymentDate: updatedData.paymentDate?.toDate?.()?.toISOString() || updatedData.paymentDate,
        createdAt: updatedData.createdAt?.toDate?.()?.toISOString() || updatedData.createdAt,
        updatedAt: updatedData.updatedAt?.toDate?.()?.toISOString() || updatedData.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar pago',
      error: error.message
    });
  }
};

// @desc    Eliminar un pago
// @route   DELETE /api/payments/:id
// @access  Private (admin only)
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection('payments').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    await db.collection('payments').doc(id).delete();

    res.json({
      success: true,
      message: 'Pago eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar pago',
      error: error.message
    });
  }
};
