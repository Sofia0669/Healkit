// Consultas SQL de Ventas.
import { pool } from '../../config/db.js';

export async function buscarProductos(texto) {
  const like = `%${texto}%`;
  const [filas] = await pool.execute(
    `SELECT id_producto AS id, codigo, nombre, precio_venta AS precioVenta, stock_actual AS stock
       FROM productos
      WHERE activo = 1 AND (nombre LIKE ? OR codigo LIKE ?)
      ORDER BY nombre`,
    [like, like]
  );
  return filas;
}

export async function listarClientes() {
  const [filas] = await pool.execute(
    'SELECT id_cliente AS id, identificacion, nombre FROM clientes WHERE activo = 1 ORDER BY nombre'
  );
  return filas;
}

export async function obtenerProducto(idProducto) {
  const [filas] = await pool.execute(
    'SELECT id_producto, nombre, precio_venta, activo FROM productos WHERE id_producto = ?',
    [idProducto]
  );
  return filas[0] ?? null;
}

export async function clienteExiste(idCliente) {
  const [filas] = await pool.execute(
    'SELECT id_cliente FROM clientes WHERE id_cliente = ? AND activo = 1',
    [idCliente]
  );
  return filas.length > 0;
}

export async function registrarVenta(venta, lineas) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();

    const [resultado] = await conexion.execute(
      `INSERT INTO ventas (id_cliente, id_usuario, subtotal, total, metodo_pago, estado)
       VALUES (?, ?, ?, ?, ?, 'COMPLETADA')`,
      [venta.idCliente, venta.idUsuario, venta.total, venta.total, venta.metodoPago]
    );
    const idVenta = resultado.insertId;

    for (const linea of lineas) {
      const [descuento] = await conexion.execute(
        `UPDATE productos SET stock_actual = stock_actual - ?
          WHERE id_producto = ? AND stock_actual >= ?`,
        [linea.cantidad, linea.idProducto, linea.cantidad]
      );
      if (descuento.affectedRows === 0) {
        throw Object.assign(new Error(`Stock insuficiente de "${linea.nombre}"`), { status: 409 });
      }

      await conexion.execute(
        `INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [idVenta, linea.idProducto, linea.cantidad, linea.precioUnitario, linea.subtotal]
      );
      await conexion.execute(
        `INSERT INTO movimientos_inventario (id_producto, tipo, cantidad, motivo, id_venta)
         VALUES (?, 'SALIDA', ?, ?, ?)`,
        [linea.idProducto, linea.cantidad, `Venta #${idVenta}`, idVenta]
      );
    }

    await conexion.commit();
    return idVenta;
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}

export async function listarVentas(idUsuario = null) {
  const [filas] = await pool.execute(
    `SELECT v.id_venta AS id, CONCAT('F-', LPAD(v.id_venta, 6, '0')) AS numeroFactura,
            v.fecha, v.total, v.metodo_pago AS metodoPago, v.estado, c.nombre AS cliente, u.nombre AS vendedor
       FROM ventas v
       LEFT JOIN clientes c ON c.id_cliente = v.id_cliente
       LEFT JOIN usuarios u ON u.id_usuario = v.id_usuario
      WHERE (? IS NULL OR v.id_usuario = ?)
      ORDER BY v.id_venta DESC`,
    [idUsuario, idUsuario]
  );
  return filas;
}

export async function obtenerVenta(idVenta, idUsuario = null) {
  const [ventas] = await pool.execute(
    `SELECT v.id_venta AS id, CONCAT('F-', LPAD(v.id_venta, 6, '0')) AS numeroFactura,
            v.fecha, v.subtotal, v.impuesto, v.total, v.metodo_pago AS metodoPago, v.estado,
            c.nombre AS cliente, c.identificacion AS identificacionCliente, c.correo AS correoCliente,
            u.nombre AS vendedor
       FROM ventas v
       LEFT JOIN clientes c ON c.id_cliente = v.id_cliente
       LEFT JOIN usuarios u ON u.id_usuario = v.id_usuario
      WHERE v.id_venta = ? AND (? IS NULL OR v.id_usuario = ?)`,
    [idVenta, idUsuario, idUsuario]
  );
  if (!ventas[0]) return null;

  const [detalles] = await pool.execute(
    `SELECT p.codigo, p.nombre, d.cantidad, d.precio_unitario AS precioUnitario, d.subtotal
       FROM detalle_venta d
       JOIN productos p ON p.id_producto = d.id_producto
      WHERE d.id_venta = ?`,
    [idVenta]
  );
  return { ...ventas[0], detalles };
}

// Reportes
const RANGO = `v.estado = 'COMPLETADA' AND v.fecha >= ? AND v.fecha < DATE_ADD(?, INTERVAL 1 DAY)`;

export async function reporteResumen(desde, hasta) {
  const [filas] = await pool.execute(
    `SELECT COUNT(*) AS cantidadVentas, COALESCE(SUM(v.total), 0) AS totalVendido
       FROM ventas v WHERE ${RANGO}`,
    [desde, hasta]
  );
  return filas[0];
}

export async function reportePorDia(desde, hasta) {
  const [filas] = await pool.execute(
    `SELECT DATE_FORMAT(v.fecha, '%Y-%m-%d') AS dia, COUNT(*) AS cantidadVentas, SUM(v.total) AS total
       FROM ventas v WHERE ${RANGO}
      GROUP BY dia ORDER BY dia`,
    [desde, hasta]
  );
  return filas;
}

export async function reporteProductosMasVendidos(desde, hasta) {
  const [filas] = await pool.execute(
    `SELECT p.codigo, p.nombre, SUM(d.cantidad) AS unidades, SUM(d.subtotal) AS total
       FROM detalle_venta d
       JOIN ventas v ON v.id_venta = d.id_venta
       JOIN productos p ON p.id_producto = d.id_producto
      WHERE ${RANGO}
      GROUP BY p.id_producto, p.codigo, p.nombre
      ORDER BY unidades DESC, total DESC
      LIMIT 10`,
    [desde, hasta]
  );
  return filas;
}

export async function reportePorMetodoPago(desde, hasta) {
  const [filas] = await pool.execute(
    `SELECT v.metodo_pago AS metodoPago, COUNT(*) AS cantidadVentas, SUM(v.total) AS total
       FROM ventas v WHERE ${RANGO}
      GROUP BY v.metodo_pago ORDER BY total DESC`,
    [desde, hasta]
  );
  return filas;
}

export async function reportePorVendedor(desde, hasta) {
  const [filas] = await pool.execute(
    `SELECT COALESCE(u.nombre, 'Sin vendedor') AS vendedor, COUNT(*) AS cantidadVentas, SUM(v.total) AS total
       FROM ventas v
       LEFT JOIN usuarios u ON u.id_usuario = v.id_usuario
      WHERE ${RANGO}
      GROUP BY v.id_usuario, u.nombre ORDER BY total DESC`,
    [desde, hasta]
  );
  return filas;
}

// Anulación
export async function anularVenta(idVenta, idUsuario, motivo) {
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();

    const [ventas] = await conexion.execute(
      'SELECT estado FROM ventas WHERE id_venta = ? FOR UPDATE',
      [idVenta]
    );
    if (!ventas[0]) throw Object.assign(new Error('Venta no encontrada'), { status: 404 });
    if (ventas[0].estado !== 'COMPLETADA') {
      throw Object.assign(new Error('Solo se pueden anular ventas completadas'), { status: 409 });
    }

    await conexion.execute("UPDATE ventas SET estado = 'ANULADA' WHERE id_venta = ?", [idVenta]);

    const [lineas] = await conexion.execute(
      'SELECT id_producto, cantidad FROM detalle_venta WHERE id_venta = ?',
      [idVenta]
    );
    for (const linea of lineas) {
      await conexion.execute(
        'UPDATE productos SET stock_actual = stock_actual + ? WHERE id_producto = ?',
        [linea.cantidad, linea.id_producto]
      );
      await conexion.execute(
        `INSERT INTO movimientos_inventario (id_producto, tipo, cantidad, motivo, id_venta, id_usuario)
         VALUES (?, 'ENTRADA', ?, ?, ?, ?)`,
        [linea.id_producto, linea.cantidad, `Anulación venta #${idVenta}: ${motivo}`, idVenta, idUsuario]
      );
    }

    await conexion.commit();
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}
