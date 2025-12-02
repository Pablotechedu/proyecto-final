import bcrypt from 'bcryptjs';

/**
 * Hash de password
 * @param {String} password - Password en texto plano
 * @returns {Promise<String>} Password hasheado
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

/**
 * Comparar password
 * @param {String} password - Password en texto plano
 * @param {String} hashedPassword - Password hasheado
 * @returns {Promise<Boolean>} True si coinciden
 */
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
