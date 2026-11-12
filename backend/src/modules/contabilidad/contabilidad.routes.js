import { Router } from 'express';
import { pendiente } from './contabilidad.controller.js';
const router = Router();
router.get('/', pendiente);
export default router;
