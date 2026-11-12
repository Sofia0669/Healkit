import * as modelo from './inventario.model.js';

export function validarProducto(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Datos inválidos');
  const codigo = typeof body.codigo === 'string' ? body.codigo.trim() : '';
  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
  if (!codigo || codigo.length > 30 || !nombre || nombre.length > 180) {
    throw new Error('Código y nombre son obligatorios y deben respetar su longitud');
  }
  const stock = Number(body.stock);
  const stockMinimo = Number(body.stockMinimo);
  if (!Number.isInteger(stock) || stock < 0 || !Number.isInteger(stockMinimo) || stockMinimo < 0) {
    throw new Error('Stock y stock mínimo deben ser enteros no negativos');
  }
  const vencimiento = body.vencimiento || null;
  if (vencimiento !== null && !/^\d{4}-\d{2}-\d{2}$/.test(vencimiento)) {
    throw new Error('Vencimiento debe tener formato AAAA-MM-DD');
  }
  return {
    codigo, nombre,
    categoria: String(body.categoria ?? '').slice(0,100),
    presentacion: String(body.presentacion ?? '').slice(0,100),
    stock, stockMinimo, vencimiento
  };
}

export const listar = modelo.listarProductos;
export const buscar = modelo.buscarProducto;
export const eliminar = modelo.borrarProducto;
export async function crear(datos) { return modelo.insertarProducto(validarProducto(datos)); }
export async function actualizar(id, datos) { return modelo.actualizarProducto(id, validarProducto(datos)); }
