import express from 'express';
const router = express.Router();
import {  auth  } from '../middlewares/auth.middleware.js';
import {  checkRole  } from '../middlewares/role.middleware.js';
import * as statsController from '../controllers/statsController.js';

const {
  getDashboardStats,
  getSessionsByMonth,
  getRevenueByMonth,
  getTopPatients
} = statsController;

/**
 * @route   GET /api/stats/dashboard
 * @desc    Obtener estadísticas generales del dashboard
 * @access  Private (admin, editor)
 */
router.get('/dashboard', auth, checkRole(['admin', 'editor']), getDashboardStats);

/**
 * @route   GET /api/stats/sessions-by-month
 * @desc    Obtener estadísticas de sesiones por mes
 * @access  Private (admin, editor)
 */
router.get('/sessions-by-month', auth, checkRole(['admin', 'editor']), getSessionsByMonth);

/**
 * @route   GET /api/stats/revenue-by-month
 * @desc    Obtener estadísticas de ingresos por mes
 * @access  Private (admin, editor)
 */
router.get('/revenue-by-month', auth, checkRole(['admin', 'editor']), getRevenueByMonth);

/**
 * @route   GET /api/stats/top-patients
 * @desc    Obtener top pacientes por número de sesiones
 * @access  Private (admin, editor)
 */
router.get('/top-patients', auth, checkRole(['admin', 'editor']), getTopPatients);

export default router;
