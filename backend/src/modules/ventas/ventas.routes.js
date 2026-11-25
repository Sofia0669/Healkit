import { Router } from 'express';
import * as controller from './ventas.controller.js';
import { autorizarRol } from '../../middleware/autorizarRol.js';
import { ROLES } from '../../config/roles.js';

const router = Router();
router.get('/productos', controller.buscarProductos);
router.get('/clientes', controller.listarClientes);
router.get('/reportes', autorizarRol(ROLES.ADMIN, ROLES.ENCARGADO), controller.reportes);
router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.get('/:id/factura/pdf', controller.descargarFactura);
router.post('/', controller.crear);
router.patch('/:id/anular', autorizarRol(ROLES.ADMIN, ROLES.ENCARGADO), controller.anular);
export default router;
