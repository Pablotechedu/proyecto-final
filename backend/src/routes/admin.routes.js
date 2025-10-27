const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth.middleware');
const { checkAdminOrDirector } = require('../middlewares/role.middleware');

// TODO: Implementar controladores de admin (estadísticas, reportes)

router.get('/stats', auth, checkAdminOrDirector, (req, res) => {
  res.json({ success: true, message: 'Endpoint de estadísticas - Por implementar', data: {} });
});

router.get('/reports', auth, checkAdminOrDirector, (req, res) => {
  res.json({ success: true, message: 'Endpoint de reportes - Por implementar', data: [] });
});

module.exports = router;
