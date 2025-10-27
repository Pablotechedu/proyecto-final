const { db } = require('../config/firebase');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');

/**
 * Registrar nuevo usuario
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    // Validar campos requeridos
    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password y nombre son requeridos' 
      });
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Formato de email inválido' 
      });
    }
    
    // Validar longitud de password
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }
    
    // Verificar que el email no exista
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email.toLowerCase()).get();
    
    if (!snapshot.empty) {
      return res.status(400).json({ 
        success: false, 
        message: 'El email ya está registrado' 
      });
    }
    
    // Hash del password
    const hashedPassword = await hashPassword(password);
    
    // Determinar rol (por defecto 'usuario')
    const userRole = role || 'usuario';
    const validRoles = ['admin', 'organizador', 'usuario', 'therapist', 'editor'];
    
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({ 
        success: false, 
        message: `Rol inválido. Roles válidos: ${validRoles.join(', ')}` 
      });
    }
    
    // Crear usuario
    const userRef = await usersRef.add({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: userRole,
      isActive: true,
      isDirector: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Generar token
    const token = generateToken({
      userId: userRef.id,
      email: email.toLowerCase(),
      role: userRole,
      isDirector: false
    });
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        token,
        user: {
          id: userRef.id,
          email: email.toLowerCase(),
          name,
          role: userRole,
          isDirector: false
        }
      }
    });
    
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al registrar usuario',
      error: error.message 
    });
  }
};

/**
 * Login de usuario
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email y contraseña son requeridos' 
      });
    }
    
    // Buscar usuario por email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email.toLowerCase()).get();
    
    if (snapshot.empty) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      });
    }
    
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    
    // Verificar que el usuario esté activo
    if (userData.isActive === false) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario inactivo. Contacta al administrador.' 
      });
    }
    
    // Verificar password
    const isValidPassword = await comparePassword(password, userData.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      });
    }
    
    // Generar token
    const token = generateToken({
      userId: userDoc.id,
      email: userData.email,
      role: userData.role,
      isDirector: userData.isDirector || false
    });
    
    // Actualizar último login
    await userDoc.ref.update({
      lastLogin: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: userDoc.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          isDirector: userData.isDirector || false,
          googleCalendarId: userData.googleCalendarId
        }
      }
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al iniciar sesión',
      error: error.message 
    });
  }
};

/**
 * Obtener usuario actual
 * GET /api/auth/me
 */
exports.getMe = async (req, res) => {
  try {
    const userRef = db.collection('users').doc(req.user.userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }
    
    const userData = userDoc.data();
    
    res.json({
      success: true,
      data: {
        id: userDoc.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        isDirector: userData.isDirector || false,
        googleCalendarId: userData.googleCalendarId,
        phone: userData.phone,
        createdAt: userData.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error en getMe:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener usuario',
      error: error.message 
    });
  }
};

/**
 * Actualizar perfil de usuario
 * PUT /api/auth/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.userId;
    
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }
    
    // Preparar datos a actualizar
    const updateData = {
      updatedAt: new Date().toISOString()
    };
    
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    
    await userRef.update(updateData);
    
    const updatedDoc = await userRef.get();
    const updatedData = updatedDoc.data();
    
    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        id: updatedDoc.id,
        email: updatedData.email,
        name: updatedData.name,
        role: updatedData.role,
        phone: updatedData.phone,
        isDirector: updatedData.isDirector || false
      }
    });
    
  } catch (error) {
    console.error('Error en updateProfile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar perfil',
      error: error.message 
    });
  }
};

/**
 * Cambiar contraseña
 * PUT /api/auth/change-password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Contraseña actual y nueva contraseña son requeridas' 
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'La nueva contraseña debe tener al menos 6 caracteres' 
      });
    }
    
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }
    
    const userData = userDoc.data();
    
    // Verificar contraseña actual
    const isValidPassword = await comparePassword(currentPassword, userData.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Contraseña actual incorrecta' 
      });
    }
    
    // Hash de nueva contraseña
    const hashedPassword = await hashPassword(newPassword);
    
    await userRef.update({
      password: hashedPassword,
      updatedAt: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
    
  } catch (error) {
    console.error('Error en changePassword:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al cambiar contraseña',
      error: error.message 
    });
  }
};
