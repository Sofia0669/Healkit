
import { Producto } from './inventario.model.js';
import * as repository from './inventario.repository.js';

// Consultar productos.
export async function listar() {
  return repository.listar();
}

// Buscar un producto.
export async function buscar(id) {
  return repository.buscarPorId(id);
}

// Validar datos recibidos.
function validar(datos) {
  if (!datos ||
      typeof datos !== 'object' ||
      Array.isArray(datos)) {
    throw new Error('Datos de producto inválidos');
  }

  const codigo = String(datos.codigo ?? '').trim();
  const nombre = String(datos.nombre ?? '').trim();

  if (!codigo || !nombre) {
    throw new Error('Código y nombre son obligatorios');
  }

  const stock = Number(datos.stock);
  const stockMinimo = Number(datos.stockMinimo);
  const precioCompra = Number(datos.precioCompra);
  const precioVenta = Number(datos.precioVenta);

  if (!Number.isInteger(stock) || stock < 0 ||
      !Number.isInteger(stockMinimo) || stockMinimo < 0) {
    throw new Error('Las existencias deben ser enteros no negativos');
  }

  if (datos.precioCompra == null ||
      datos.precioCompra === '' ||
      datos.precioVenta == null ||
      datos.precioVenta === '' ||
      !Number.isFinite(precioCompra) || precioCompra < 0 ||
      !Number.isFinite(precioVenta) || precioVenta < 0) {
    throw new Error('Los precios deben ser válidos');
  }

  for (const campo of ['idCategoria', 'idProveedor']) {
    const valor = datos[campo];

    if (valor != null && valor !== '' &&
        (!Number.isSafeInteger(Number(valor)) ||
         Number(valor) <= 0)) {
      throw new Error(`${campo} inválido`);
    }
  }

  return new Producto({
    codigo,
    nombre,
    descripcion: datos.descripcion ?? null,
    idCategoria: datos.idCategoria || null,
    idProveedor: datos.idProveedor || null,
    precioCompra,
    precioVenta,
    stock,
    stockMinimo,
    requiereReceta: datos.requiereReceta === true ||
                    datos.requiereReceta === 1
  });
}

// Registrar producto.
export async function crear(datos) {
  const producto = validar(datos);
  return repository.crear(producto);
}

// Modificar producto.
export async function actualizar(id, datos) {
  const producto = validar(datos);
  return repository.actualizar(id, producto);
}

// Eliminar producto.
export async function eliminar(id) {
  return repository.eliminar(id);
}
