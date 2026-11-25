
import { Router } from 'express';
import * as controller from './usuarios.controller.js';

import { autenticar } from '../../middleware/autenticar.js';
import { autorizarRol } from '../../middleware/autorizarRol.js';

const router = Router();

// Solo usuarios autenticados.
router.use(autenticar);

// Solo administradores.
router.use(
  autorizarRol('Administrador', 'Administrador General')
);

// Consultar los roles disponibles.
router.get('/roles', controller.listarRoles);

// Listar todos los usuarios.
router.get('/', controller.listar);

// Consultar un usuario por su ID.
router.get('/:id', controller.obtenerPorId);

// Registrar un usuario.
router.post('/', controller.crear);

// Actualizar nombre, correo y rol.
router.put('/:id', controller.actualizar);

// Eliminar lógicamente un usuario.
router.delete('/:id', controller.eliminar);

// Cambiar únicamente el rol.
router.patch('/:id/rol', controller.cambiarRol);

// Activar o desactivar.
router.patch('/:id/estado', controller.cambiarEstado);

export default router;
