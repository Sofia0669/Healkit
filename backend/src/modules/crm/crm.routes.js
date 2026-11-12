import { Router } from 'express';
import { pendiente } from './crm.controller.js';
const router = Router();
router.get('/', pendiente);
export default router;
