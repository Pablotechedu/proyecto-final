import express from 'express';
import { auth } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/role.middleware.js';
import upload from '../middlewares/upload.middleware.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

/**
 * @route   POST /api/upload/image
 * @desc    Subir una imagen
 * @access  Private (admin, editor)
 */
router.post('/image', auth, checkRole(['admin', 'editor']), upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen'
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(201).json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: imageUrl,
        path: req.file.path
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir la imagen',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/upload/images
 * @desc    Subir múltiples imágenes
 * @access  Private (admin, editor)
 */
router.post('/images', auth, checkRole(['admin', 'editor']), upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron imágenes'
      });
    }

    const images = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
      path: file.path
    }));

    res.status(201).json({
      success: true,
      message: `${images.length} imagen(es) subida(s) exitosamente`,
      data: images
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir las imágenes',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/upload/:filename
 * @desc    Eliminar una imagen
 * @access  Private (admin)
 */
router.delete('/:filename', auth, checkRole(['admin']), (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads', filename);

    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    // Eliminar el archivo
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la imagen',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/upload/list
 * @desc    Listar todas las imágenes
 * @access  Private
 */
router.get('/list', auth, (req, res) => {
  try {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    if (!fs.existsSync(uploadDir)) {
      return res.json({
        success: true,
        data: []
      });
    }

    const files = fs.readdirSync(uploadDir);
    const images = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      })
      .map(file => {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          url: `/uploads/${file}`,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        };
      });

    res.json({
      success: true,
      data: images
    });
  } catch (error) {
    console.error('Error listing images:', error);
    res.status(500).json({
      success: false,
      message: 'Error al listar las imágenes',
      error: error.message
    });
  }
});

export default router;
