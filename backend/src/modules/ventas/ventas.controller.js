import * as servicio from './ventas.service.js';

const manejar = (fn) => async (req, res, next) => {
  try { await fn(req, res); } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    next(error);
  }
};

export const listar = manejar(async (req, res) => res.json(await servicio.listar(req.usuario)));

export const listarClientes = manejar(async (_req, res) => res.json(await servicio.listarClientes()));

export const buscarProductos = manejar(async (req, res) => res.json(await servicio.buscarProductos(req.query.q)));

export const obtener = manejar(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'ID inválido' });
  res.json(await servicio.buscar(id, req.usuario));
});

export const crear = manejar(async (req, res) => {
  res.status(201).json(await servicio.crear(req.body, req.usuario.id));
});

export const descargarFactura = manejar(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'ID inválido' });
  const { nombreArchivo, pdf } = await servicio.generarFactura(id, req.usuario);
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${nombreArchivo}"`
  });
  res.send(pdf);
});

export const reportes = manejar(async (req, res) => {
  res.json(await servicio.reportes({ desde: req.query.desde, hasta: req.query.hasta }));
});

export const anular = manejar(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'ID inválido' });
  res.json(await servicio.anular(id, req.body, req.usuario.id));
});
