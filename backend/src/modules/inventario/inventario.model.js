import { pool } from '../../config/db.js';

export async function listarProductos() {
  const [filas] = await pool.execute(
    'SELECT id, codigo, nombre, categoria, presentacion, stock, stock_minimo AS stockMinimo, DATE_FORMAT(vencimiento, "%Y-%m-%d") AS vencimiento FROM productos ORDER BY id DESC'
  );
  return filas;
}

export async function buscarProducto(id) {
  const [filas] = await pool.execute(
    'SELECT id, codigo, nombre, categoria, presentacion, stock, stock_minimo AS stockMinimo, DATE_FORMAT(vencimiento, "%Y-%m-%d") AS vencimiento FROM productos WHERE id = ?', [id]
  );
  return filas[0] ?? null;
}

export async function insertarProducto(p) {
  const [resultado] = await pool.execute(
    'INSERT INTO productos (codigo,nombre,categoria,presentacion,stock,stock_minimo,vencimiento) VALUES (?,?,?,?,?,?,?)',
    [p.codigo,p.nombre,p.categoria,p.presentacion,p.stock,p.stockMinimo,p.vencimiento]
  );
  return buscarProducto(resultado.insertId);
}

export async function actualizarProducto(id, p) {
  const [resultado] = await pool.execute(
    'UPDATE productos SET codigo=?,nombre=?,categoria=?,presentacion=?,stock=?,stock_minimo=?,vencimiento=? WHERE id=?',
    [p.codigo,p.nombre,p.categoria,p.presentacion,p.stock,p.stockMinimo,p.vencimiento,id]
  );
  return resultado.affectedRows ? buscarProducto(id) : null;
}

export async function borrarProducto(id) {
  const [resultado] = await pool.execute('DELETE FROM productos WHERE id=?', [id]);
  return resultado.affectedRows > 0;
}
