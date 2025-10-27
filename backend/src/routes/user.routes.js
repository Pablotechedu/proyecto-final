const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/role.middleware');
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
router.get('/', auth, checkRole(['admin']), getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener un usuario por ID
 * @access  Private (admin)
 */
router.get('/:id', auth, checkRole(['admin']), getUser);

/**
 * @route   POST /api/users
 * @desc    Crear un nuevo usuario
 * @access  Private (admin)
 */
router.post('/', auth, checkRole(['admin']), createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar un usuario
 * @access  Private (admin)
 */
router.put('/:id', auth, checkRole(['admin']), updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Eliminar un usuario
 * @access  Private (admin)
 */
router.delete('/:id', auth, checkRole(['admin']), deleteUser);

module.exports = router;
