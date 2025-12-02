import {  db  } from '../config/firebase.js';
import {  paginate  } from '../utils/pagination.js';

// @desc    Obtener todas las sesiones
// @route   GET /api/sessions
// @access  Private
export const getSessions = async (req, res) => {
  try {
    const { page = 1, limit = 10, patientId = '', status = '' } = req.query;

    let query = db.collection('sessions');

    // Filtrar por paciente si se proporciona
    if (patientId) {
      query = query.where('patientId', '==', patientId);
    }

    // Filtrar por estado si se proporciona
    if (status) {
      query = query.where('status', '==', status);
    }

    // Obtener todos los documentos
    const snapshot = await query.get();
    let sessions = [];

    snapshot.forEach(doc => {
      sessions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Ordenar por fecha (más recientes primero)
    sessions.sort((a, b) => {
      const dateA = a.startTime?.toDate?.() || new Date(a.startTime || 0);
      const dateB = b.startTime?.toDate?.() || new Date(b.startTime || 0);
      return dateB - dateA;
    });

    // Paginar resultados
    const paginatedData = paginate(sessions, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      data: paginatedData.data,
      pagination: paginatedData.pagination
    });
  } catch (error) {
    console.error('Error getting sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sesiones',
      error: error.message
    });
  }
};

// @desc    Obtener una sesión por ID
// @route   GET /api/sessions/:id
// @access  Private
export const getSession = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection('sessions').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Sesión no encontrada'
      });
    }

    const session = {
      id: doc.id,
      ...doc.data()
    };

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sesión',
      error: error.message
    });
  }
};

// @desc    Crear una nueva sesión
// @route   POST /api/sessions
// @access  Private
export const createSession = async (req, res) => {
  try {
    const sessionData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.id
    };

    const docRef = await db.collection('sessions').add(sessionData);

    res.status(201).json({
      success: true,
      message: 'Sesión creada exitosamente',
      data: {
        id: docRef.id,
        ...sessionData
      }
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear sesión',
      error: error.message
    });
  }
};

// @desc    Actualizar una sesión
// @route   PUT /api/sessions/:id
// @access  Private
export const updateSession = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection('sessions').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Sesión no encontrada'
      });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date(),
      updatedBy: req.user.id
    };

    await db.collection('sessions').doc(id).update(updateData);

    res.json({
      success: true,
      message: 'Sesión actualizada exitosamente',
      data: {
        id,
        ...doc.data(),
        ...updateData
      }
    });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar sesión',
      error: error.message
    });
  }
};

// @desc    Eliminar una sesión
// @route   DELETE /api/sessions/:id
// @access  Private (admin only)
export const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection('sessions').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Sesión no encontrada'
      });
    }

    await db.collection('sessions').doc(id).delete();

    res.json({
      success: true,
      message: 'Sesión eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar sesión',
      error: error.message
    });
  }
};
