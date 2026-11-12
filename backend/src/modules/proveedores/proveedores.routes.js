import { Router } from 'express';
import { pendiente } from './proveedores.controller.js';
const router = Router();
router.get('/', pendiente);
export default router;
