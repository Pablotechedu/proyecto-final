import { verifyToken } from "../utils/jwt.js";
import { db } from "../config/firebase.js";

/**
 * Middleware para verificar autenticación JWT
 * Verifica que el token sea válido Y que el usuario exista en la base de datos
 */
export const auth = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No autorizado - Token no proporcionado",
      });
    }

    // Extraer token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No autorizado - Token inválido",
      });
    }

    // Verificar token
    const decoded = verifyToken(token);

    // Verificar que el usuario exista en la base de datos
    const userDoc = await db.collection("users").doc(decoded.id).get();

    if (!userDoc.exists) {
      return res.status(401).json({
        success: false,
        message: "Usuario no encontrado o desactivado - Por favor inicia sesión nuevamente",
      });
    }

    // Agregar usuario al request con datos frescos de la BD
    const userData = userDoc.data();
    req.user = {
      id: userDoc.id,
      ...userData,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expirado - Por favor inicia sesión nuevamente",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
      });
    }

    console.error("Error en middleware de autenticación:", error);
    res.status(401).json({
      success: false,
      message: "Error de autenticación",
      error: error.message,
    });
  }
};

/**
 * Middleware opcional de autenticación
 * Agrega el usuario si hay token, pero no falla si no hay
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = verifyToken(token);

      // Intentar obtener datos frescos del usuario
      const userDoc = await db.collection("users").doc(decoded.id).get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        req.user = {
          id: userDoc.id,
          ...userData,
        };
      }
    }

    next();
  } catch (error) {
    // Ignorar errores en auth opcional
    next();
  }
};
