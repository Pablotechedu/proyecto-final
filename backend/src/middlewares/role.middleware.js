/**
 * Middleware para verificar roles de usuario
 * @param {Array<String>} allowedRoles - Roles permitidos
 * @returns {Function} Middleware function
 */
exports.checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'No autorizado - Debes iniciar sesión' 
      });
    }
    
    // Verificar que el usuario tenga un rol
    if (!req.user.role) {
      return res.status(403).json({ 
        success: false, 
        message: 'Usuario sin rol asignado' 
      });
    }
    
    // Verificar que el rol esté en la lista de permitidos
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Acceso denegado - Se requiere rol: ${allowedRoles.join(' o ')}`,
        userRole: req.user.role
      });
    }
    
    next();
  };
};

/**
 * Middleware para verificar si el usuario es director
 */
exports.checkDirector = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'No autorizado' 
    });
  }
  
  if (!req.user.isDirector) {
    return res.status(403).json({ 
      success: false, 
      message: 'Acceso denegado - Solo el director puede realizar esta acción' 
    });
  }
  
  next();
};

/**
 * Middleware para verificar si el usuario es admin o director
 */
exports.checkAdminOrDirector = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'No autorizado' 
    });
  }
  
  const isAdmin = req.user.role === 'admin';
  const isDirector = req.user.isDirector === true;
  
  if (!isAdmin && !isDirector) {
    return res.status(403).json({ 
      success: false, 
      message: 'Acceso denegado - Se requiere rol de administrador o director' 
    });
  }
  
  next();
};

/**
 * Middleware para verificar si el usuario puede acceder a recursos de un terapeuta específico
 * Los terapeutas solo pueden ver sus propios recursos
 * Los admins y directores pueden ver todos
 */
exports.checkTherapistAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'No autorizado' 
    });
  }
  
  const isAdmin = req.user.role === 'admin';
  const isDirector = req.user.isDirector === true;
  const isTherapist = req.user.role === 'therapist';
  
  // Admins y directores tienen acceso total
  if (isAdmin || isDirector) {
    return next();
  }
  
  // Terapeutas solo pueden acceder a sus propios recursos
  if (isTherapist) {
    const therapistId = req.params.therapistId || req.query.therapistId || req.body.therapistId;
    
    if (therapistId && therapistId !== req.user.userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'No puedes acceder a recursos de otros terapeutas' 
      });
    }
    
    return next();
  }
  
  // Otros roles no tienen acceso
  res.status(403).json({ 
    success: false, 
    message: 'Acceso denegado' 
  });
};
