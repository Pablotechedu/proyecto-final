const { db } = require('../config/firebase');
const { paginate } = require('../utils/pagination');

// @desc    Obtener todos los pacientes
// @route   GET /api/patients
// @access  Private
exports.getPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;

    let query = db.collection('patients');

    // Filtrar por estado si se proporciona
    if (status) {
      query = query.where('status', '==', status);
    }

    // Obtener todos los documentos
    const snapshot = await query.get();
    let patients = [];

    snapshot.forEach(doc => {
      patients.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Filtrar por búsqueda en el lado del cliente (Firestore no soporta búsqueda de texto completo)
    if (search) {
      const searchLower = search.toLowerCase();
      patients = patients.filter(patient => {
        const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.toLowerCase();
        return fullName.includes(searchLower) ||
               patient.name?.toLowerCase().includes(searchLower) ||
               patient.firstName?.toLowerCase().includes(searchLower) ||
               patient.lastName?.toLowerCase().includes(searchLower) ||
               patient.patientID?.toLowerCase().includes(searchLower) ||
               patient.patientCode?.toLowerCase().includes(searchLower) ||
               patient.email?.toLowerCase().includes(searchLower) ||
               patient.studentEmail?.toLowerCase().includes(searchLower);
      });
    }

    // Ordenar por fecha de creación (más recientes primero)
    patients.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });

    // Paginar resultados
    const paginatedData = paginate(patients, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      data: paginatedData.data,
      pagination: {
        currentPage: paginatedData.pagination.page,
        totalPages: paginatedData.pagination.pages,
        totalItems: paginatedData.pagination.total,
        itemsPerPage: paginatedData.pagination.limit
      }
    });
  } catch (error) {
    console.error('Error getting patients:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pacientes',
      error: error.message
    });
  }
};

// @desc    Obtener un paciente por ID
// @route   GET /api/patients/:id
// @access  Private
exports.getPatient = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection('patients').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    // Obtener subcolecciones
    const parentTutorsSnapshot = await db.collection('patients').doc(id).collection('parentTutors').get();
    const relatedProfessionalsSnapshot = await db.collection('patients').doc(id).collection('relatedProfessionals').get();

    const parentTutors = [];
    parentTutorsSnapshot.forEach(doc => {
      parentTutors.push({ id: doc.id, ...doc.data() });
    });

    const relatedProfessionals = [];
    relatedProfessionalsSnapshot.forEach(doc => {
      relatedProfessionals.push({ id: doc.id, ...doc.data() });
    });

    const patient = {
      id: doc.id,
      ...doc.data(),
      parentTutors,
      relatedProfessionals
    };

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Error getting patient:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener paciente',
      error: error.message
    });
  }
};

// @desc    Crear un nuevo paciente
// @route   POST /api/patients
// @access  Private (admin, editor)
exports.createPatient = async (req, res) => {
  try {
    const patientData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.id
    };

    const docRef = await db.collection('patients').add(patientData);

    res.status(201).json({
      success: true,
      message: 'Paciente creado exitosamente',
      data: {
        id: docRef.id,
        ...patientData
      }
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear paciente',
      error: error.message
    });
  }
};

// @desc    Actualizar un paciente
// @route   PUT /api/patients/:id
// @access  Private (admin, editor)
exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection('patients').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date(),
      updatedBy: req.user.id
    };

    await db.collection('patients').doc(id).update(updateData);

    res.json({
      success: true,
      message: 'Paciente actualizado exitosamente',
      data: {
        id,
        ...doc.data(),
        ...updateData
      }
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar paciente',
      error: error.message
    });
  }
};

// @desc    Eliminar un paciente
// @route   DELETE /api/patients/:id
// @access  Private (admin only)
exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection('patients').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    // Eliminar subcolecciones primero
    const parentTutorsSnapshot = await db.collection('patients').doc(id).collection('parentTutors').get();
    const deleteParentTutors = parentTutorsSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deleteParentTutors);

    const relatedProfessionalsSnapshot = await db.collection('patients').doc(id).collection('relatedProfessionals').get();
    const deleteRelatedProfessionals = relatedProfessionalsSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deleteRelatedProfessionals);

    // Eliminar el paciente
    await db.collection('patients').doc(id).delete();

    res.json({
      success: true,
      message: 'Paciente eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar paciente',
      error: error.message
    });
  }
};
