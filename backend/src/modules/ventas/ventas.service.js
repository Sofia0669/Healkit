// Validaciones y reglas de negocio de Ventas.
import * as repositorio from './ventas.repository.js';
import { METODOS_PAGO } from './ventas.model.js';
import { generarFacturaPdf } from './factura.pdf.js';

const soloPropias = (usuario) => (usuario?.rol === 'Empleado' ? usuario.id : null);

const crearError = (mensaje, status) => Object.assign(new Error(mensaje), { status });

export function validarVenta(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw crearError('Datos inválidos', 400);

  const metodoPago = body.metodoPago ?? 'EFECTIVO';
  if (!METODOS_PAGO.includes(metodoPago)) throw crearError('Método de pago inválido', 400);

  const idCliente = body.idCliente ? Number(body.idCliente) : null;
  if (idCliente !== null && (!Number.isInteger(idCliente) || idCliente < 1)) {
    throw crearError('Cliente inválido', 400);
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw crearError('La venta debe tener al menos un producto', 400);
  }
  const items = body.items.map((item) => ({
    idProducto: Number(item.idProducto),
    cantidad: Number(item.cantidad)
  }));
  for (const item of items) {
    if (!Number.isInteger(item.idProducto) || item.idProducto < 1) throw crearError('Producto inválido', 400);
    if (!Number.isInteger(item.cantidad) || item.cantidad < 1) throw crearError('La cantidad debe ser un entero mayor a 0', 400);
  }

  return { idCliente, metodoPago, items };
}

export async function crear(body, idUsuario) {
  const { idCliente, metodoPago, items } = validarVenta(body);

  if (idCliente !== null && !(await repositorio.clienteExiste(idCliente))) {
    throw crearError('El cliente no existe', 404);
  }

  const lineas = [];
  for (const item of items) {
    const producto = await repositorio.obtenerProducto(item.idProducto);
    if (!producto || !producto.activo) throw crearError(`El producto ${item.idProducto} no existe`, 404);
    const precioUnitario = Number(producto.precio_venta);
    lineas.push({
      idProducto: item.idProducto,
      nombre: producto.nombre,
      cantidad: item.cantidad,
      precioUnitario,
      subtotal: precioUnitario * item.cantidad
    });
  }

  const total = lineas.reduce((suma, linea) => suma + linea.subtotal, 0);
  const idVenta = await repositorio.registrarVenta({ idCliente, idUsuario, metodoPago, total }, lineas);
  return repositorio.obtenerVenta(idVenta);
}

export const listar = (usuario) => repositorio.listarVentas(soloPropias(usuario));
export const listarClientes = repositorio.listarClientes;
export const buscarProductos = (texto = '') => repositorio.buscarProductos(String(texto).trim());

export async function buscar(id, usuario) {
  const venta = await repositorio.obtenerVenta(id, soloPropias(usuario));
  if (!venta) throw crearError('Venta no encontrada', 404);
  return venta;
}

export async function generarFactura(id, usuario) {
  const venta = await buscar(id, usuario);
  return { nombreArchivo: `${venta.numeroFactura}.pdf`, pdf: await generarFacturaPdf(venta) };
}

// Reportes
const aTexto = (f) => `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;

function validarFecha(texto, nombre) {
  const [anio, mes, dia] = String(texto).split('-').map(Number);
  const f = new Date(anio, mes - 1, dia);
  const valida = /^\d{4}-\d{2}-\d{2}$/.test(texto) &&
    f.getFullYear() === anio && f.getMonth() === mes - 1 && f.getDate() === dia;
  if (!valida) throw crearError(`La fecha "${nombre}" no es válida (use AAAA-MM-DD)`, 400);
}

export async function reportes({ desde, hasta } = {}) {
  const hoy = new Date();
  desde = desde || aTexto(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  hasta = hasta || aTexto(hoy);
  validarFecha(desde, 'desde');
  validarFecha(hasta, 'hasta');
  if (desde > hasta) throw crearError('La fecha "desde" no puede ser posterior a "hasta"', 400);

  const [resumen, porDia, productosMasVendidos, porMetodoPago, porVendedor] = await Promise.all([
    repositorio.reporteResumen(desde, hasta),
    repositorio.reportePorDia(desde, hasta),
    repositorio.reporteProductosMasVendidos(desde, hasta),
    repositorio.reportePorMetodoPago(desde, hasta),
    repositorio.reportePorVendedor(desde, hasta)
  ]);
  return { desde, hasta, resumen, porDia, productosMasVendidos, porMetodoPago, porVendedor };
}

// Anulación
export async function anular(id, body, idUsuario) {
  const motivo = typeof body?.motivo === 'string' ? body.motivo.trim() : '';
  if (motivo.length < 3 || motivo.length > 150) {
    throw crearError('Indica el motivo de la anulación (entre 3 y 150 caracteres)', 400);
  }
  await repositorio.anularVenta(id, idUsuario, motivo);
  return repositorio.obtenerVenta(id);
}
