
import { Router } from 'express';
import * as controller from './inventario.controller.js';

import { autenticar } from '../../middleware/autenticar.js';
import { autorizarRol } from '../../middleware/autorizarRol.js';
import { ROLES } from '../../config/roles.js';

const router = Router();

const TODOS = [
  ROLES.ADMIN,
  ROLES.ENCARGADO,
  ROLES.EMPLEADO
];

const GESTORES = [
  ROLES.ADMIN,
  ROLES.ENCARGADO
];

router.get(
  '/categorias',
  autenticar,
  autorizarRol(...TODOS),
  controller.listarCategorias
);

router.get(
  '/proveedores',
  autenticar,
  autorizarRol(...TODOS),
  controller.listarProveedores
);

// Los tres roles pueden consultar.
router.get(
  '/',
  autenticar,
  autorizarRol(...TODOS),
  controller.listar
);

router.get(
  '/:id',
  autenticar,
  autorizarRol(...TODOS),
  controller.obtener
);

// Solo Administrador y Encargado pueden modificar.
router.post(
  '/',
  autenticar,
  autorizarRol(...GESTORES),
  controller.crear
);

router.put(
  '/:id',
  autenticar,
  autorizarRol(...GESTORES),
  controller.actualizar
);

router.delete(
  '/:id',
  autenticar,
  autorizarRol(...GESTORES),
  controller.eliminar
);


export default router;
