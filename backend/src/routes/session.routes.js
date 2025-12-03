import express from 'express';
const router = express.Router();
import {  auth  } from '../middlewares/auth.middleware.js';
import {  checkAdmin  } from '../middlewares/role.middleware.js';
import * as sessionController from '../controllers/sessionController.js';

const {
  getSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession
} = sessionController;

/**
 * @route   GET /api/sessions
 * @desc    Obtener todas las sesiones (con paginación y filtros)
 * @access  Private
 */
router.get('/', auth, getSessions);

/**
 * @route   GET /api/sessions/:id
 * @desc    Obtener sesión por ID
 * @access  Private
 */
router.get('/:id', auth, getSession);

/**
 * @route   POST /api/sessions
 * @desc    Crear nueva sesión
 * @access  Private
 */
router.post('/', auth, createSession);

/**
 * @route   PUT /api/sessions/:id
 * @desc    Actualizar sesión
 * @access  Private
 */
router.put('/:id', auth, updateSession);

/**
 * @route   DELETE /api/sessions/:id
 * @desc    Eliminar sesión
 * @access  Private (admin)
 */
router.delete('/:id', auth, checkAdmin, deleteSession);

export default router;
