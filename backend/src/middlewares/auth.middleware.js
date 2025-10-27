const { verifyToken } = require('../utils/jwt');

/**
 * Middleware para verificar autenticación JWT
 */
exports.auth = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No autorizado - Token no proporcionado' 
      });
    }
    
    // Extraer token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No autorizado - Token inválido' 
      });
    }
    
    // Verificar token
    const decoded = verifyToken(token);
    
    // Agregar usuario al request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expirado - Por favor inicia sesión nuevamente' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido' 
      });
    }
    
    res.status(401).json({ 
      success: false, 
      message: 'Error de autenticación',
      error: error.message 
    });
  }
};

/**
 * Middleware opcional de autenticación
 * Agrega el usuario si hay token, pero no falla si no hay
 */
exports.optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Ignorar errores en auth opcional
    next();
  }
};
