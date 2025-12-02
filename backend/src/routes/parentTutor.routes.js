import express from 'express';
const router = express.Router({ mergeParams: true }); // Para acceder a :patientId
import {  auth  } from '../middlewares/auth.middleware.js';
import {  checkRole  } from '../middlewares/role.middleware.js';
import { db } from '../config/firebase.js';

/**
 * @route   GET /api/patients/:patientId/parents
 * @desc    Obtener padres/tutores de un paciente
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const { patientId } = req.params;

    const snapshot = await db
      .collection('patients')
      .doc(patientId)
      .collection('parentTutors')
      .get();

    const parents = [];
    snapshot.forEach(doc => {
      parents.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      data: parents
    });
  } catch (error) {
    console.error('Error getting parents:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener padres/tutores',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/patients/:patientId/parents
 * @desc    Agregar padre/tutor a un paciente
 * @access  Private
 */
router.post('/', auth, checkRole(['admin', 'editor']), async (req, res) => {
  try {
    const { patientId } = req.params;

    const parentData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db
      .collection('patients')
      .doc(patientId)
      .collection('parentTutors')
      .add(parentData);

    res.status(201).json({
      success: true,
      message: 'Padre/tutor agregado exitosamente',
      data: {
        id: docRef.id,
        ...parentData
      }
    });
  } catch (error) {
    console.error('Error adding parent:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar padre/tutor',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/patients/:patientId/parents/:parentId
 * @desc    Actualizar padre/tutor
 * @access  Private
 */
router.put('/:parentId', auth, checkRole(['admin', 'editor']), async (req, res) => {
  try {
    const { patientId, parentId } = req.params;

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    await db
      .collection('patients')
      .doc(patientId)
      .collection('parentTutors')
      .doc(parentId)
      .update(updateData);

    res.json({
      success: true,
      message: 'Padre/tutor actualizado exitosamente',
      data: {
        id: parentId,
        ...updateData
      }
    });
  } catch (error) {
    console.error('Error updating parent:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar padre/tutor',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/patients/:patientId/parents/:parentId
 * @desc    Eliminar padre/tutor
 * @access  Private
 */
router.delete('/:parentId', auth, checkRole(['admin', 'editor']), async (req, res) => {
  try {
    const { patientId, parentId } = req.params;

    await db
      .collection('patients')
      .doc(patientId)
      .collection('parentTutors')
      .doc(parentId)
      .delete();

    res.json({
      success: true,
      message: 'Padre/tutor eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting parent:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar padre/tutor',
      error: error.message
    });
  }
});

export default router;
