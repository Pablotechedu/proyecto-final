const { db, auth } = require('../config/firebase');
const bcrypt = require('../utils/bcrypt');

/**
 * @desc    Obtener todos los usuarios
 * @route   GET /api/users
 * @access  Private (admin)
 */
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;

    // Obtener usuarios de Firestore
    let query = db.collection('users');

    if (role) {
      query = query.where('role', '==', role);
    }

    const snapshot = await query.get();
    let users = [];

    snapshot.forEach(doc => {
      const userData = doc.data();
      // No enviar password
      delete userData.password;
      users.push({
        id: doc.id,
        ...userData
      });
    });

    // Filtrar por búsqueda
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user =>
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    }

    // Ordenar por fecha de creación
    users.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });

    // Paginación simple
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = users.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedUsers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(users.length / limit),
        totalItems: users.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener un usuario por ID
 * @route   GET /api/users/:id
 * @access  Private (admin)
 */
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection('users').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const userData = doc.data();
    delete userData.password;

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...userData
      }
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message
    });
  }
};

/**
 * @desc    Crear un nuevo usuario
 * @route   POST /api/users
 * @access  Private (admin)
 */
exports.createUser = async (req, res) => {
  try {
    const { email, password, name, role = 'viewer', isDirector = false } = req.body;

    // Validar campos requeridos
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password y nombre son requeridos'
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await db.collection('users').where('email', '==', email).get();
    if (!existingUser.empty) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Crear usuario en Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name
    });

    // Encriptar password para Firestore
    const hashedPassword = await bcrypt.hashPassword(password);

    // Guardar en Firestore
    const userData = {
      email,
      password: hashedPassword,
      name,
      role,
      isDirector: isDirector === true,
      uid: userRecord.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.id
    };

    await db.collection('users').doc(userRecord.uid).set(userData);

    // No enviar password en respuesta
    delete userData.password;

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        id: userRecord.uid,
        ...userData
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizar un usuario
 * @route   PUT /api/users/:id
 * @access  Private (admin)
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, role, password, isDirector } = req.body;

    const doc = await db.collection('users').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const updateData = {
      updatedAt: new Date(),
      updatedBy: req.user.id
    };

    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (email) updateData.email = email;
    if (typeof isDirector !== 'undefined') updateData.isDirector = isDirector === true;

    // Si se proporciona nueva contraseña
    if (password) {
      updateData.password = await bcrypt.hashPassword(password);
      
      // Actualizar en Firebase Auth también
      try {
        await auth.updateUser(id, { password });
      } catch (authError) {
        console.error('Error updating auth password:', authError);
      }
    }

    // Actualizar en Firebase Auth
    if (email || name) {
      try {
        const authUpdate = {};
        if (email) authUpdate.email = email;
        if (name) authUpdate.displayName = name;
        await auth.updateUser(id, authUpdate);
      } catch (authError) {
        console.error('Error updating auth user:', authError);
      }
    }

    await db.collection('users').doc(id).update(updateData);

    // No enviar password
    delete updateData.password;

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: {
        id,
        ...doc.data(),
        ...updateData
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message
    });
  }
};

/**
 * @desc    Eliminar un usuario
 * @route   DELETE /api/users/:id
 * @access  Private (admin)
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir que el admin se elimine a sí mismo
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu propio usuario'
      });
    }

    const doc = await db.collection('users').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Eliminar de Firestore primero
    await db.collection('users').doc(id).delete();

    // Intentar eliminar de Firebase Auth (opcional, puede fallar por permisos)
    try {
      await auth.deleteUser(id);
    } catch (authError) {
      console.warn('No se pudo eliminar de Firebase Auth (requiere permisos adicionales):', authError.message);
      // No es crítico, el usuario ya no puede iniciar sesión porque no existe en Firestore
    }

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente de la base de datos'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
};
