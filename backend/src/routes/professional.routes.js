import express from 'express';
const router = express.Router({ mergeParams: true }); // Para acceder a :patientId
import {  auth  } from '../middlewares/auth.middleware.js';
import {  checkCanEdit  } from '../middlewares/role.middleware.js';
import { db } from '../config/firebase.js';

/**
 * @route   GET /api/patients/:patientId/professionals
 * @desc    Obtener profesionales de un paciente
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const { patientId } = req.params;

    const snapshot = await db
      .collection('patients')
      .doc(patientId)
      .collection('relatedProfessionals')
      .get();

    const professionals = [];
    snapshot.forEach(doc => {
      professionals.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      data: professionals
    });
  } catch (error) {
    console.error('Error getting professionals:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener profesionales',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/patients/:patientId/professionals
 * @desc    Agregar profesional a un paciente
 * @access  Private
 */
router.post('/', auth, checkCanEdit, async (req, res) => {
  try {
    const { patientId } = req.params;

    const professionalData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db
      .collection('patients')
      .doc(patientId)
      .collection('relatedProfessionals')
      .add(professionalData);

    res.status(201).json({
      success: true,
      message: 'Profesional agregado exitosamente',
      data: {
        id: docRef.id,
        ...professionalData
      }
    });
  } catch (error) {
    console.error('Error adding professional:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar profesional',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/patients/:patientId/professionals/:professionalId
 * @desc    Actualizar profesional
 * @access  Private
 */
router.put('/:professionalId', auth, checkCanEdit, async (req, res) => {
  try {
    const { patientId, professionalId } = req.params;

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    await db
      .collection('patients')
      .doc(patientId)
      .collection('relatedProfessionals')
      .doc(professionalId)
      .update(updateData);

    res.json({
      success: true,
      message: 'Profesional actualizado exitosamente',
      data: {
        id: professionalId,
        ...updateData
      }
    });
  } catch (error) {
    console.error('Error updating professional:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar profesional',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/patients/:patientId/professionals/:professionalId
 * @desc    Eliminar profesional
 * @access  Private
 */
router.delete('/:professionalId', auth, checkCanEdit, async (req, res) => {
  try {
    const { patientId, professionalId } = req.params;

    await db
      .collection('patients')
      .doc(patientId)
      .collection('relatedProfessionals')
      .doc(professionalId)
      .delete();

    res.json({
      success: true,
      message: 'Profesional eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting professional:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar profesional',
      error: error.message
    });
  }
});

export default router;
