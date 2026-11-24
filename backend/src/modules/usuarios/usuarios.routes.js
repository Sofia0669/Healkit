
import { Router } from 'express';
import * as controller from './usuarios.controller.js';

import { autenticar } from '../../middleware/autenticar.js';
import { autorizarRol } from '../../middleware/autorizarRol.js';

const router = Router();

// Proteger todo el módulo de Usuarios.
router.use(autenticar);

// Admitir el nombre actual y el futuro del rol administrador.
router.use(
  autorizarRol('Administrador', 'Administrador General')
);

// Consultar los roles.
router.get('/roles', controller.listarRoles);

// Consultar los usuarios.
router.get('/', controller.listar);

// Registrar un nuevo usuario.
router.post('/', controller.crear);

// Cambiar el rol de un usuario.
router.patch('/:id/rol', controller.cambiarRol);

// Activar o desactivar una cuenta.
router.patch('/:id/estado', controller.cambiarEstado);

export default router;
