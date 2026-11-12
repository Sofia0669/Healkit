import * as servicio from './inventario.service.js';

const manejar = (fn) => async (req,res,next) => {
  try { await fn(req,res); } catch (error) {
    if (error.message.startsWith('Datos inválidos') || error.message.startsWith('Código y nombre') || error.message.startsWith('Stock y stock') || error.message.startsWith('Vencimiento debe')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

function idValido(req,res) {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) { res.status(400).json({error:'ID inválido'}); return null; }
  return id;
}

export const listar = manejar(async (_req,res) => res.json(await servicio.listar()));
export const obtener = manejar(async (req,res) => {
  const id=idValido(req,res); if (id===null) return;
  const p=await servicio.buscar(id);
  if (!p) return res.status(404).json({error:'Producto no encontrado'});
  res.json(p);
});
export const crear = manejar(async (req,res) => {
  res.status(201).json(await servicio.crear(req.body));
});
export const actualizar = manejar(async (req,res) => {
  const id=idValido(req,res); if (id===null) return;
  const p=await servicio.actualizar(id,req.body);
  if (!p) return res.status(404).json({error:'Producto no encontrado'});
  res.json(p);
});
export const eliminar = manejar(async (req,res) => {
  const id=idValido(req,res); if (id===null) return;
  const ok=await servicio.eliminar(id);
  if (!ok) return res.status(404).json({error:'Producto no encontrado'});
  res.status(204).end();
});
