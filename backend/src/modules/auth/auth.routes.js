
import { Router } from 'express';

import * as controller from './auth.controller.js';
import { autenticar } from '../../middleware/autenticar.js';

const router = Router();

// Iniciar sesión
router.post('/login', controller.login);

// Consultar perfil autenticado
router.get('/perfil', autenticar, controller.perfil);

export default router;
