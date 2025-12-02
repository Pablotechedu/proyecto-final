import express from 'express';
const router = express.Router();
import {  auth  } from '../middlewares/auth.middleware.js';

// TODO: Implementar controladores de eventos (requisito del proyecto)

router.get('/', auth, (req, res) => {
  res.json({ success: true, message: 'Endpoint de eventos - Por implementar', data: [] });
});

router.get('/:id', auth, (req, res) => {
  res.json({ success: true, message: 'Endpoint de evento por ID - Por implementar' });
});

router.post('/', auth, (req, res) => {
  res.json({ success: true, message: 'Endpoint de crear evento - Por implementar' });
});

router.put('/:id', auth, (req, res) => {
  res.json({ success: true, message: 'Endpoint de actualizar evento - Por implementar' });
});

router.delete('/:id', auth, (req, res) => {
  res.json({ success: true, message: 'Endpoint de eliminar evento - Por implementar' });
});

export default router;
