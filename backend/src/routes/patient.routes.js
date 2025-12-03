import express from 'express';
const router = express.Router();
import {  auth  } from '../middlewares/auth.middleware.js';
import {  checkCanEdit, checkAdmin  } from '../middlewares/role.middleware.js';
import * as patientController from '../controllers/patientController.js';

const {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient
} = patientController;

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
router.post('/', auth, checkCanEdit, createPatient);

/**
 * @route   PUT /api/patients/:id
 * @desc    Actualizar paciente
 * @access  Private (admin, editor)
 */
router.put('/:id', auth, checkCanEdit, updatePatient);

/**
 * @route   DELETE /api/patients/:id
 * @desc    Eliminar paciente
 * @access  Private (admin)
 */
router.delete('/:id', auth, checkAdmin, deletePatient);

export default router;
