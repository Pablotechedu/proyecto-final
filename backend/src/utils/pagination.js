/**
 * Helper para paginación
 * @param {Array} data - Array de datos completo
 * @param {Number} page - Número de página (1-indexed)
 * @param {Number} limit - Cantidad de items por página
 * @returns {Object} Datos paginados con metadata
 */
export const paginate = (data, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedData = data.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: data.length,
      pages: Math.ceil(data.length / limit),
      hasNext: endIndex < data.length,
      hasPrev: page > 1
    }
  };
};

/**
 * Obtener parámetros de paginación de query
 * @param {Object} query - Query params del request
 * @returns {Object} Parámetros de paginación validados
 */
export const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  
  return { page, limit };
};
