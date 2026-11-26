
import { pool } from '../../config/db.js';
import { Producto } from './inventario.model.js';

// Convertir una fila de MySQL en un producto.
function convertirProducto(fila) {
  return new Producto({
    id: fila.id_producto,
    codigo: fila.codigo,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    idCategoria: fila.id_categoria,
    idProveedor: fila.id_proveedor,
    precioCompra: Number(fila.precio_compra),
    precioVenta: Number(fila.precio_venta),
    stock: fila.stock_actual,
    stockMinimo: fila.stock_minimo,
    requiereReceta: Boolean(fila.requiere_receta)
  });
}

// Obtener todos los productos activos.
export async function listar() {
  const [filas] = await pool.query(
    `SELECT * FROM productos
     WHERE activo = 1
     ORDER BY nombre`
  );

  return filas.map(convertirProducto);
}

// Obtener un producto por su ID.
export async function buscarPorId(id) {
  const [filas] = await pool.execute(
    `SELECT * FROM productos
     WHERE id_producto = ? AND activo = 1`,
    [id]
  );

  if (filas.length === 0) {
    return null;
  }

  return convertirProducto(filas[0]);
}

// Insertar un producto.
export async function crear(producto) {
  const [resultado] = await pool.execute(
    `INSERT INTO productos
      (codigo, nombre, descripcion, id_categoria,
       id_proveedor, precio_compra, precio_venta,
       stock_actual, stock_minimo, requiere_receta)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      producto.codigo,
      producto.nombre,
      producto.descripcion,
      producto.idCategoria,
      producto.idProveedor,
      producto.precioCompra,
      producto.precioVenta,
      producto.stock,
      producto.stockMinimo,
      producto.requiereReceta
    ]
  );

  return buscarPorId(resultado.insertId);
}

// Actualizar un producto.
export async function actualizar(id, producto) {
  const [resultado] = await pool.execute(
    `UPDATE productos
     SET codigo = ?,
         nombre = ?,
         descripcion = ?,
         id_categoria = ?,
         id_proveedor = ?,
         precio_compra = ?,
         precio_venta = ?,
         stock_actual = ?,
         stock_minimo = ?,
         requiere_receta = ?
     WHERE id_producto = ? AND activo = 1`,
    [
      producto.codigo,
      producto.nombre,
      producto.descripcion,
      producto.idCategoria,
      producto.idProveedor,
      producto.precioCompra,
      producto.precioVenta,
      producto.stock,
      producto.stockMinimo,
      producto.requiereReceta,
      id
    ]
  );

  if (resultado.affectedRows === 0) {
    return null;
  }

  return buscarPorId(id);
}

// Desactivar un producto.
export async function eliminar(id) {
  const [resultado] = await pool.execute(
    `UPDATE productos
     SET activo = 0
     WHERE id_producto = ? AND activo = 1`,
    [id]
  );

  return resultado.affectedRows > 0;
}



export async function listarCategorias() {
  const [filas] = await pool.query(
    `SELECT
       id_categoria AS id,
       nombre
     FROM categorias
     ORDER BY nombre ASC`
  );

  return filas;
}

export async function listarProveedores() {
  const [filas] = await pool.query(
    `SELECT
       id_proveedor AS id,
       nombre
     FROM proveedores
     WHERE activo = 1
     ORDER BY nombre ASC`
  );

  return filas;
}
