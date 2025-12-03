import express from 'express';
const router = express.Router();
import {  auth  } from '../middlewares/auth.middleware.js';
import {  checkAdmin  } from '../middlewares/role.middleware.js';
import * as paymentController from '../controllers/paymentController.js';

const {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment
} = paymentController;

/**
 * @route   GET /api/payments
 * @desc    Obtener todos los pagos (con paginación y filtros)
 * @access  Private
 */
router.get('/', auth, getPayments);

/**
 * @route   GET /api/payments/:id
 * @desc    Obtener pago por ID
 * @access  Private
 */
router.get('/:id', auth, getPayment);

/**
 * @route   POST /api/payments
 * @desc    Registrar nuevo pago
 * @access  Private
 */
router.post('/', auth, createPayment);

/**
 * @route   PUT /api/payments/:id
 * @desc    Actualizar pago
 * @access  Private
 */
router.put('/:id', auth, updatePayment);

/**
 * @route   DELETE /api/payments/:id
 * @desc    Eliminar pago
 * @access  Private (admin)
 */
router.delete('/:id', auth, checkAdmin, deletePayment);

export default router;
