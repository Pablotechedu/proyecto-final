import express from 'express';
const router = express.Router();
import {  auth  } from '../middlewares/auth.middleware.js';
import {  checkAnyPermission  } from '../middlewares/role.middleware.js';
import * as financialController from '../controllers/financialController.js';

const { getFinancialSummary } = financialController;

/**
 * @route   GET /api/financial/summary
 * @desc    Obtener resumen financiero del mes actual
 * @access  Private (admin, editor, director)
 */
router.get('/summary', auth, checkAnyPermission(['isAdmin', 'isEditor', 'isDirector']), getFinancialSummary);

export default router;
