import { Router } from 'express';
import { pendiente } from './ventas.controller.js';
const router = Router();
router.get('/', pendiente);
export default router;
