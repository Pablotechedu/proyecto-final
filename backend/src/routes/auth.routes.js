import express from 'express';
const router = express.Router();
import * as authController from '../controllers/authController.js';
import {  auth  } from '../middlewares/auth.middleware.js';

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuario
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener usuario actual
 * @access  Private
 */
router.get('/me', auth, authController.getMe);

/**
 * @route   PUT /api/auth/profile
 * @desc    Actualizar perfil de usuario
 * @access  Private
 */
router.put('/profile', auth, authController.updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Cambiar contraseña
 * @access  Private
 */
router.put('/change-password', auth, authController.changePassword);

export default router;
