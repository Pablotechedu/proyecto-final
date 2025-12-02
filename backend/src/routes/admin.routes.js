import express from 'express';
const router = express.Router();
import {  auth  } from '../middlewares/auth.middleware.js';
import {  checkAdminOrDirector  } from '../middlewares/role.middleware.js';

// TODO: Implementar controladores de admin (estadísticas, reportes)

router.get('/stats', auth, checkAdminOrDirector, (req, res) => {
  res.json({ success: true, message: 'Endpoint de estadísticas - Por implementar', data: {} });
});

router.get('/reports', auth, checkAdminOrDirector, (req, res) => {
  res.json({ success: true, message: 'Endpoint de reportes - Por implementar', data: [] });
});

export default router;
