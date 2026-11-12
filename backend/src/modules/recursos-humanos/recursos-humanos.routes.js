import { Router } from 'express';
import { pendiente } from './recursos-humanos.controller.js';
const router = Router();
router.get('/', pendiente);
export default router;
