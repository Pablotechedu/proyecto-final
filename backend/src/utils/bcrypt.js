const bcrypt = require('bcryptjs');

/**
 * Hash de password
 * @param {String} password - Password en texto plano
 * @returns {Promise<String>} Password hasheado
 */
exports.hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

/**
 * Comparar password
 * @param {String} password - Password en texto plano
 * @param {String} hashedPassword - Password hasheado
 * @returns {Promise<Boolean>} True si coinciden
 */
exports.comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
