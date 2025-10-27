/**
 * Middleware para verificar permisos de usuario
 * Sistema basado en checkboxes de permisos
 */

/**
 * Middleware para verificar si el usuario tiene un permiso específico
 * @param {String} permission - Permiso requerido (isAdmin, isEditor, isTherapist, isDirector)
 * @returns {Function} Middleware function
 */
exports.checkPermission = (permission) => {
  return (req, res, next) => {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'No autorizado - Debes iniciar sesión' 
      });
    }
    
    // Verificar que el usuario tenga permisos
    if (!req.user.permissions) {
      return res.status(403).json({ 
        success: false, 
        message: 'Usuario sin permisos asignados' 
      });
    }
    
    // Verificar que tenga el permiso específico
    if (!req.user.permissions[permission]) {
      return res.status(403).json({ 
        success: false, 
        message: `Acceso denegado - Se requiere permiso: ${permission}`,
        userPermissions: req.user.permissions
      });
    }
    
    next();
  };
};

/**
 * Middleware para verificar si el usuario tiene al menos uno de varios permisos
 * @param {Array<String>} permissions - Lista de permisos (cualquiera es válido)
 * @returns {Function} Middleware function
 */
exports.checkAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'No autorizado - Debes iniciar sesión' 
      });
    }
    
    if (!req.user.permissions) {
      return res.status(403).json({ 
        success: false, 
        message: 'Usuario sin permisos asignados' 
      });
    }
    
    // Verificar si tiene al menos uno de los permisos
    const hasPermission = permissions.some(permission => req.user.permissions[permission] === true);
    
    if (!hasPermission) {
      return res.status(403).json({ 
        success: false, 
        message: `Acceso denegado - Se requiere uno de estos permisos: ${permissions.join(', ')}`,
        userPermissions: req.user.permissions
      });
    }
    
    next();
  };
};

/**
 * Middleware para verificar si el usuario tiene TODOS los permisos especificados
 * @param {Array<String>} permissions - Lista de permisos (todos son requeridos)
 * @returns {Function} Middleware function
 */
exports.checkAllPermissions = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'No autorizado - Debes iniciar sesión' 
      });
    }
    
    if (!req.user.permissions) {
      return res.status(403).json({ 
        success: false, 
        message: 'Usuario sin permisos asignados' 
      });
    }
    
    // Verificar si tiene todos los permisos
    const hasAllPermissions = permissions.every(permission => req.user.permissions[permission] === true);
    
    if (!hasAllPermissions) {
      return res.status(403).json({ 
        success: false, 
        message: `Acceso denegado - Se requieren todos estos permisos: ${permissions.join(', ')}`,
        userPermissions: req.user.permissions
      });
    }
    
    next();
  };
};

/**
 * Middleware para verificar si el usuario es administrador
 */
exports.checkAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'No autorizado' 
    });
  }
  
  if (!req.user.permissions?.isAdmin) {
    return res.status(403).json({ 
      success: false, 
      message: 'Acceso denegado - Se requiere permiso de administrador' 
    });
  }
  
  next();
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
  
  if (!req.user.permissions?.isDirector) {
    return res.status(403).json({ 
      success: false, 
      message: 'Acceso denegado - Se requiere permiso de director' 
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
  
  const isAdmin = req.user.permissions?.isAdmin === true;
  const isDirector = req.user.permissions?.isDirector === true;
  
  if (!isAdmin && !isDirector) {
    return res.status(403).json({ 
      success: false, 
      message: 'Acceso denegado - Se requiere permiso de administrador o director' 
    });
  }
  
  next();
};

/**
 * Middleware para verificar acceso de terapeuta
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
  
  const isAdmin = req.user.permissions?.isAdmin === true;
  const isDirector = req.user.permissions?.isDirector === true;
  const isTherapist = req.user.permissions?.isTherapist === true;
  
  // Admins y directores tienen acceso total
  if (isAdmin || isDirector) {
    return next();
  }
  
  // Terapeutas solo pueden acceder a sus propios recursos
  if (isTherapist) {
    const therapistId = req.params.therapistId || req.query.therapistId || req.body.therapistId;
    
    if (therapistId && therapistId !== req.user.id) {
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
    message: 'Acceso denegado - Se requiere permiso de terapeuta' 
  });
};

/**
 * Middleware para verificar si puede editar (Admin o Editor)
 */
exports.checkCanEdit = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'No autorizado' 
    });
  }
  
  const canEdit = req.user.permissions?.isAdmin || req.user.permissions?.isEditor;
  
  if (!canEdit) {
    return res.status(403).json({ 
      success: false, 
      message: 'Acceso denegado - Se requiere permiso de administrador o editor' 
    });
  }
  
  next();
};

/**
 * Middleware para verificar si puede eliminar (solo Admin)
 */
exports.checkCanDelete = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'No autorizado' 
    });
  }
  
  if (!req.user.permissions?.isAdmin) {
    return res.status(403).json({ 
      success: false, 
      message: 'Acceso denegado - Solo los administradores pueden eliminar' 
    });
  }
  
  next();
};

// Mantener compatibilidad con código antiguo
exports.checkRole = (allowedRoles) => {
  return (req, res, next) => {
    console.warn('checkRole está deprecado, usa checkPermission o checkAnyPermission');
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'No autorizado' 
      });
    }
    
    // Mapear roles antiguos a permisos nuevos
    const rolePermissionMap = {
      'admin': 'isAdmin',
      'editor': 'isEditor',
      'therapist': 'isTherapist',
      'viewer': null // viewer ya no existe
    };
    
    const hasPermission = allowedRoles.some(role => {
      const permission = rolePermissionMap[role];
      return permission && req.user.permissions?.[permission] === true;
    });
    
    if (!hasPermission) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acceso denegado' 
      });
    }
    
    next();
  };
};
