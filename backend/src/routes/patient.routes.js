const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/role.middleware');
const {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient
} = require('../controllers/patientController');

/**
 * @route   GET /api/patients
 * @desc    Obtener todos los pacientes (con paginación)
 * @access  Private
 */
router.get('/', auth, getPatients);

/**
 * @route   GET /api/patients/:id
 * @desc    Obtener paciente por ID
 * @access  Private
 */
router.get('/:id', auth, getPatient);

/**
 * @route   POST /api/patients
 * @desc    Crear nuevo paciente
 * @access  Private (admin, editor)
 */
router.post('/', auth, checkRole(['admin', 'editor']), createPatient);

/**
 * @route   PUT /api/patients/:id
 * @desc    Actualizar paciente
 * @access  Private (admin, editor)
 */
router.put('/:id', auth, checkRole(['admin', 'editor']), updatePatient);

/**
 * @route   DELETE /api/patients/:id
 * @desc    Eliminar paciente
 * @access  Private (admin)
 */
router.delete('/:id', auth, checkRole(['admin']), deletePatient);

module.exports = router;
