import express from 'express';
const router = express.Router();
import { auth } from '../middlewares/auth.middleware.js';
import { checkAdmin } from '../middlewares/role.middleware.js';
import * as userController from '../controllers/userController.js';

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = userController;

/**
 * @route   GET /api/users/therapists
 * @desc    Obtener todos los terapeutas (para asignación de pacientes)
 * @access  Private (cualquier usuario autenticado)
 */
router.get('/therapists', auth, getUsers);

/**
 * @route   GET /api/users
 * @desc    Obtener todos los usuarios
 * @access  Private (admin)
 */
router.get('/', auth, checkAdmin, getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener un usuario por ID
 * @access  Private (admin)
 */
router.get('/:id', auth, checkAdmin, getUser);

/**
 * @route   POST /api/users
 * @desc    Crear un nuevo usuario
 * @access  Private (admin)
 */
router.post('/', auth, checkAdmin, createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar un usuario
 * @access  Private (admin)
 */
router.put('/:id', auth, checkAdmin, updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Eliminar un usuario
 * @access  Private (admin)
 */
router.delete('/:id', auth, checkAdmin, deleteUser);

export default router;
