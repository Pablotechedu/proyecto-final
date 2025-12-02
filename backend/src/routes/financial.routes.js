const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth.middleware');
const { checkAnyPermission } = require('../middlewares/role.middleware');
const { getFinancialSummary } = require('../controllers/financialController');

/**
 * @route   GET /api/financial/summary
 * @desc    Obtener resumen financiero del mes actual
 * @access  Private (admin, editor, director)
 */
router.get('/summary', auth, checkAnyPermission(['isAdmin', 'isEditor', 'isDirector']), getFinancialSummary);

module.exports = router;
