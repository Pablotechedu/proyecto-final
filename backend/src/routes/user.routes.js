const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth.middleware');
const { checkAdmin } = require('../middlewares/role.middleware');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

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

module.exports = router;
