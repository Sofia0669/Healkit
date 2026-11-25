import * as service from './proveedores.service.js';

function responderError(error, res, next) {
  if (error.status) {
    return res.status(error.status).json({ mensaje: error.message });
  }
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      mensaje: 'Ya existe un registro con esos datos'
    });
  }
  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ mensaje: 'El proveedor o producto indicado no existe' });
  }
  next(error);
}

function ejecutar(accion) {
  return async (req, res, next) => {
    try {
      await accion(req, res);
    } catch (error) {
      responderError(error, res, next);
    }
  };
}

export const listarProveedores = ejecutar(async (_req, res) => {
  res.json(await service.listarProveedores());
});

export const crearProveedor = ejecutar(async (req, res) => {
  res.status(201).json(await service.guardarProveedor(null, req.body));
});

export const actualizarProveedor = ejecutar(async (req, res) => {
  const proveedor = await service.guardarProveedor(req.params.id, req.body);
  if (!proveedor) return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
  res.json(proveedor);
});

export const catalogo = ejecutar(async (_req, res) => {
  res.json(await service.listarCatalogo());
});

export const listarCompras = ejecutar(async (_req, res) => {
  res.json(await service.listarCompras());
});

export const obtenerCompra = ejecutar(async (req, res) => {
  const compra = await service.obtenerCompra(req.params.id);
  if (!compra) return res.status(404).json({ mensaje: 'Orden no encontrada' });
  res.json(compra);
});

export const crearCompra = ejecutar(async (req, res) => {
  res.status(201).json(await service.crearCompra(req.body, req.usuario.id));
});

export const aprobarCompra = ejecutar(async (req, res) => {
  const compra = await service.aprobarCompra(req.params.id, req.usuario.id);
  if (!compra) return res.status(404).json({ mensaje: 'Orden no encontrada' });
  res.json(compra);
});

export const recibirCompra = ejecutar(async (req, res) => {
  const compra = await service.recibirCompra(
    req.params.id,
    req.body,
    req.usuario.id
  );
  if (!compra) return res.status(404).json({ mensaje: 'Orden no encontrada' });
  res.json(compra);
});

export const historialPrecios = ejecutar(async (req, res) => {
  res.json(await service.historialPrecios(req.query.idProveedor));
});
