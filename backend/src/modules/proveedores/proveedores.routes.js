import { Router } from 'express';
import * as controller from './proveedores.controller.js';
import { autenticar } from '../../middleware/autenticar.js';
import { autorizarRol } from '../../middleware/autorizarRol.js';
import { ROLES } from '../../config/roles.js';

const router = Router();
router.use(
  autenticar,
  autorizarRol(ROLES.ADMIN, ROLES.ENCARGADO)
);

router.get('/', controller.listarProveedores);
router.post('/', controller.crearProveedor);
router.put('/:id', controller.actualizarProveedor);

router.get('/catalogo', controller.catalogo);
router.get('/compras', controller.listarCompras);
router.post('/compras', controller.crearCompra);
router.get('/compras/:id', controller.obtenerCompra);
router.post('/compras/:id/aprobar', controller.aprobarCompra);
router.post('/compras/:id/recepciones', controller.recibirCompra);
router.get('/historial-precios', controller.historialPrecios);

export default router;
