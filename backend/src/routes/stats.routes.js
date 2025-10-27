const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/role.middleware');
const {
  getDashboardStats,
  getSessionsByMonth,
  getRevenueByMonth,
  getTopPatients
} = require('../controllers/statsController');

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

module.exports = router;
