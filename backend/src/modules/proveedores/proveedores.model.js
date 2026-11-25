import { randomUUID } from 'node:crypto';
import { pool } from '../../config/db.js';

export async function listarProveedores() {
  const [rows] = await pool.query(
    `SELECT id_proveedor, nombre, identificacion, telefono, correo, direccion,
            contacto, condiciones_pago, plazo_entrega_dias, activo
     FROM proveedores
     ORDER BY activo DESC, nombre`
  );
  return rows;
}

export async function crearProveedor(datos) {
  const [result] = await pool.execute(
    `INSERT INTO proveedores
      (nombre, identificacion, telefono, correo, direccion, contacto,
       condiciones_pago, plazo_entrega_dias)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      datos.nombre, datos.identificacion, datos.telefono, datos.correo,
      datos.direccion, datos.contacto, datos.condicionesPago,
      datos.plazoEntregaDias
    ]
  );
  return obtenerProveedor(result.insertId);
}

export async function actualizarProveedor(id, datos) {
  const [result] = await pool.execute(
    `UPDATE proveedores
     SET nombre = ?, identificacion = ?, telefono = ?, correo = ?,
         direccion = ?, contacto = ?, condiciones_pago = ?,
         plazo_entrega_dias = ?, activo = ?
     WHERE id_proveedor = ?`,
    [
      datos.nombre, datos.identificacion, datos.telefono, datos.correo,
      datos.direccion, datos.contacto, datos.condicionesPago,
      datos.plazoEntregaDias, datos.activo, id
    ]
  );
  return result.affectedRows ? obtenerProveedor(id) : null;
}

async function obtenerProveedor(id) {
  const [rows] = await pool.execute(
    `SELECT id_proveedor, nombre, identificacion, telefono, correo, direccion,
            contacto, condiciones_pago, plazo_entrega_dias, activo
     FROM proveedores WHERE id_proveedor = ?`,
    [id]
  );
  return rows[0] ?? null;
}

export async function listarCatalogo() {
  const [[proveedores], [productos]] = await Promise.all([
    pool.query(
      `SELECT id_proveedor AS id, nombre
       FROM proveedores WHERE activo = 1 ORDER BY nombre`
    ),
    pool.query(
      `SELECT id_producto AS id, codigo, nombre, precio_compra
       FROM productos WHERE activo = 1 ORDER BY nombre`
    )
  ]);
  return {
    proveedores,
    productos: productos.map((producto) => ({
      ...producto,
      precio_compra: Number(producto.precio_compra)
    }))
  };
}

export async function listarCompras() {
  const [rows] = await pool.query(
    `SELECT c.id_compra, c.id_proveedor, p.nombre AS proveedor,
            c.fecha, c.fecha_entrega_prevista, c.estado, c.total,
            (SELECT COUNT(*) FROM detalle_compra d
             WHERE d.id_compra = c.id_compra) AS lineas,
            (SELECT COALESCE(SUM(rc.total_factura), 0)
             FROM recepciones_compra rc
             WHERE rc.id_compra = c.id_compra) AS total_facturado
     FROM compras c
     JOIN proveedores p ON p.id_proveedor = c.id_proveedor
     ORDER BY c.fecha DESC, c.id_compra DESC`
  );
  return rows.map((row) => ({
    ...row,
    total: Number(row.total),
    total_facturado: Number(row.total_facturado)
  }));
}

export async function obtenerCompra(id) {
  const [orders] = await pool.execute(
    `SELECT c.*, p.nombre AS proveedor, u.nombre AS creado_por,
            ua.nombre AS aprobado_por
     FROM compras c
     JOIN proveedores p ON p.id_proveedor = c.id_proveedor
     LEFT JOIN usuarios u ON u.id_usuario = c.id_usuario
     LEFT JOIN usuarios ua ON ua.id_usuario = c.id_usuario_aprobacion
     WHERE c.id_compra = ?`,
    [id]
  );
  if (!orders.length) return null;

  const [items] = await pool.execute(
    `SELECT d.id_detalle_compra, d.id_producto, pr.codigo,
            pr.nombre AS producto, d.cantidad AS cantidad_solicitada,
            d.costo_unitario, d.subtotal,
            COALESCE(SUM(rd.cantidad), 0) AS cantidad_recibida
     FROM detalle_compra d
     JOIN productos pr ON pr.id_producto = d.id_producto
     LEFT JOIN detalle_recepcion_compra rd
       ON rd.id_detalle_compra = d.id_detalle_compra
     WHERE d.id_compra = ?
     GROUP BY d.id_detalle_compra, d.id_producto, pr.codigo, pr.nombre,
              d.cantidad, d.costo_unitario, d.subtotal
     ORDER BY d.id_detalle_compra`,
    [id]
  );
  const [receipts] = await pool.execute(
    `SELECT r.id_recepcion, r.numero_factura, r.fecha_recepcion,
            r.total_factura, u.nombre AS recibido_por
     FROM recepciones_compra r
     LEFT JOIN usuarios u ON u.id_usuario = r.id_usuario
     WHERE r.id_compra = ?
     ORDER BY r.fecha_recepcion DESC, r.id_recepcion DESC`,
    [id]
  );
  const [receiptItems] = await pool.execute(
    `SELECT rd.id_recepcion, rd.id_detalle_compra, rd.cantidad,
            rd.costo_unitario, rd.numero_lote, rd.fecha_vencimiento,
            pr.nombre AS producto
     FROM detalle_recepcion_compra rd
     JOIN detalle_compra d ON d.id_detalle_compra = rd.id_detalle_compra
     JOIN productos pr ON pr.id_producto = d.id_producto
     JOIN recepciones_compra r ON r.id_recepcion = rd.id_recepcion
     WHERE r.id_compra = ?
     ORDER BY r.fecha_recepcion DESC, rd.id_detalle_recepcion`,
    [id]
  );
  return {
    ...orders[0],
    total: Number(orders[0].total),
    items: items.map((item) => ({
      ...item,
      costo_unitario: Number(item.costo_unitario),
      subtotal: Number(item.subtotal),
      cantidad_recibida: Number(item.cantidad_recibida)
    })),
    recepciones: receipts.map((receipt) => {
      const itemsRecepcion = receiptItems.filter(
        (item) => item.id_recepcion === receipt.id_recepcion
      ).map((item) => ({
        ...item,
        costo_unitario: Number(item.costo_unitario)
      }));
      const totalProductos = itemsRecepcion.reduce(
        (total, item) => total + item.cantidad * item.costo_unitario,
        0
      );
      return {
        ...receipt,
        total_factura: Number(receipt.total_factura),
        total_productos: Number(totalProductos.toFixed(2)),
        diferencia_factura: Number(
          (Number(receipt.total_factura) - totalProductos).toFixed(2)
        ),
        items: itemsRecepcion
      };
    })
  };
}

export async function crearCompra(datos, usuarioId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [suppliers] = await connection.execute(
      'SELECT id_proveedor FROM proveedores WHERE id_proveedor = ? AND activo = 1',
      [datos.idProveedor]
    );
    if (!suppliers.length) {
      const error = new Error('El proveedor no existe o está inactivo');
      error.status = 400;
      throw error;
    }
    const [order] = await connection.execute(
      `INSERT INTO compras
        (id_proveedor, id_usuario, fecha_entrega_prevista, estado, observaciones)
       VALUES (?, ?, ?, 'BORRADOR', ?)`,
      [datos.idProveedor, usuarioId, datos.fechaEntregaPrevista, datos.observaciones]
    );
    let total = 0;
    for (const item of datos.items) {
      const [products] = await connection.execute(
        `SELECT id_producto FROM productos WHERE id_producto = ? AND activo = 1`,
        [item.idProducto]
      );
      if (!products.length) {
        const error = new Error(`El producto ${item.idProducto} no existe o está inactivo`);
        error.status = 400;
        throw error;
      }
      const subtotal = Number((item.cantidad * item.costoUnitario).toFixed(2));
      total += subtotal;
      await connection.execute(
        `INSERT INTO detalle_compra
          (id_compra, id_producto, cantidad, costo_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [order.insertId, item.idProducto, item.cantidad, item.costoUnitario, subtotal]
      );
    }
    await connection.execute(
      'UPDATE compras SET total = ? WHERE id_compra = ?',
      [Number(total.toFixed(2)), order.insertId]
    );
    await connection.commit();
    return obtenerCompra(order.insertId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function aprobarCompra(id, usuarioId) {
  const [result] = await pool.execute(
    `UPDATE compras SET estado = 'SOLICITADA',
       fecha_aprobacion = CURRENT_TIMESTAMP, id_usuario_aprobacion = ?
     WHERE id_compra = ? AND estado = 'BORRADOR'`,
    [usuarioId, id]
  );
  if (result.affectedRows) return obtenerCompra(id);
  const [rows] = await pool.execute(
    'SELECT estado FROM compras WHERE id_compra = ?',
    [id]
  );
  if (!rows.length) return null;
  const error = new Error('Solo se pueden aprobar órdenes en borrador');
  error.status = 409;
  throw error;
}

export async function recibirCompra(id, datos, usuarioId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [orders] = await connection.execute(
      `SELECT estado FROM compras WHERE id_compra = ? FOR UPDATE`,
      [id]
    );
    if (!orders.length) {
      await connection.rollback();
      return null;
    }
    if (!['SOLICITADA', 'PARCIAL'].includes(orders[0].estado)) {
      const error = new Error('La orden debe estar aprobada y pendiente de recepción');
      error.status = 409;
      throw error;
    }
    const [details] = await connection.execute(
      `SELECT d.id_detalle_compra, d.id_producto, d.cantidad,
              COALESCE(SUM(rd.cantidad), 0) AS recibido
       FROM detalle_compra d
       LEFT JOIN detalle_recepcion_compra rd
         ON rd.id_detalle_compra = d.id_detalle_compra
       WHERE d.id_compra = ?
       GROUP BY d.id_detalle_compra, d.id_producto, d.cantidad
       `,
      [id]
    );
    const detallePorId = new Map(details.map((detail) => [
      Number(detail.id_detalle_compra),
      detail
    ]));
    for (const item of datos.items) {
      const detail = detallePorId.get(item.idDetalleCompra);
      if (!detail) {
        const error = new Error('La línea recibida no pertenece a esta orden');
        error.status = 400;
        throw error;
      }
      if (item.cantidad > Number(detail.cantidad) - Number(detail.recibido)) {
        const error = new Error('La cantidad recibida supera el saldo pendiente');
        error.status = 400;
        throw error;
      }
    }
    const [receipt] = await connection.execute(
      `INSERT INTO recepciones_compra
        (id_compra, numero_factura, id_usuario, total_factura)
       VALUES (?, ?, ?, ?)`,
      [id, `PEND-${randomUUID()}`, usuarioId, datos.totalFactura]
    );
    const [[clock]] = await connection.query(
      'SELECT YEAR(CURRENT_TIMESTAMP) AS year'
    );
    const numeroFactura =
      `FAC-${clock.year}-${String(receipt.insertId).padStart(6, '0')}`;
    await connection.execute(
      'UPDATE recepciones_compra SET numero_factura = ? WHERE id_recepcion = ?',
      [numeroFactura, receipt.insertId]
    );
    for (const item of datos.items) {
      const detail = detallePorId.get(item.idDetalleCompra);
      const [lots] = await connection.execute(
        `SELECT id_lote,
                DATE_FORMAT(fecha_vencimiento, '%Y-%m-%d') AS fecha_vencimiento
         FROM lotes
         WHERE id_producto = ? AND numero_lote = ? FOR UPDATE`,
        [detail.id_producto, item.numeroLote]
      );
      if (lots.length && lots[0].fecha_vencimiento !== item.fechaVencimiento) {
        const error = new Error('El lote ya existe con otra fecha de vencimiento');
        error.status = 409;
        throw error;
      }
      let idLote;
      if (lots.length) {
        idLote = lots[0].id_lote;
        await connection.execute(
          'UPDATE lotes SET cantidad = cantidad + ? WHERE id_lote = ?',
          [item.cantidad, idLote]
        );
      } else {
        const [lot] = await connection.execute(
          `INSERT INTO lotes
            (id_producto, numero_lote, fecha_vencimiento, cantidad)
           VALUES (?, ?, ?, ?)`,
          [detail.id_producto, item.numeroLote, item.fechaVencimiento, item.cantidad]
        );
        idLote = lot.insertId;
      }
      await connection.execute(
        `INSERT INTO detalle_recepcion_compra
          (id_recepcion, id_detalle_compra, cantidad, costo_unitario,
           numero_lote, fecha_vencimiento)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          receipt.insertId, item.idDetalleCompra, item.cantidad,
          item.costoUnitario, item.numeroLote, item.fechaVencimiento
        ]
      );
      await connection.execute(
        `UPDATE productos
         SET stock_actual = stock_actual + ?, precio_compra = ?
         WHERE id_producto = ?`,
        [item.cantidad, item.costoUnitario, detail.id_producto]
      );
      await connection.execute(
        `INSERT INTO movimientos_inventario
          (id_producto, id_lote, tipo, cantidad, motivo, id_usuario, id_compra)
         VALUES (?, ?, 'ENTRADA', ?, ?, ?, ?)`,
        [
          detail.id_producto, idLote, item.cantidad,
          `Recepción ${numeroFactura}`,
          usuarioId, id
        ]
      );
    }
    const [remaining] = await connection.execute(
      `SELECT COUNT(*) AS pendientes
       FROM detalle_compra d
       WHERE d.id_compra = ?
         AND d.cantidad > (
           SELECT COALESCE(SUM(rd.cantidad), 0)
           FROM detalle_recepcion_compra rd
           WHERE rd.id_detalle_compra = d.id_detalle_compra
         )`,
      [id]
    );
    const estado = Number(remaining[0].pendientes) ? 'PARCIAL' : 'RECIBIDA';
    await connection.execute(
      `UPDATE compras SET estado = ?,
         fecha_recepcion = IF(? = 'RECIBIDA', CURRENT_TIMESTAMP, fecha_recepcion)
       WHERE id_compra = ?`,
      [estado, estado, id]
    );
    await connection.commit();
    return obtenerCompra(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function historialPrecios(idProveedor) {
  const parameters = [];
  let where = '';
  if (idProveedor) {
    where = 'AND c.id_proveedor = ?';
    parameters.push(idProveedor);
  }
  const [rows] = await pool.execute(
    `SELECT p.id_proveedor, p.nombre AS proveedor, pr.id_producto,
            pr.nombre AS producto, COUNT(*) AS recepciones,
            ROUND(AVG(rd.costo_unitario), 2) AS precio_promedio,
            MIN(rd.costo_unitario) AS precio_minimo,
            MAX(rd.costo_unitario) AS precio_maximo,
            SUBSTRING_INDEX(
              GROUP_CONCAT(rd.costo_unitario
                ORDER BY r.fecha_recepcion DESC, rd.id_detalle_recepcion DESC),
              ',', 1
            ) AS ultimo_precio,
            ROUND(AVG(TIMESTAMPDIFF(DAY, c.fecha_entrega_prevista,
              r.fecha_recepcion)), 1) AS demora_promedio_dias,
            MAX(r.fecha_recepcion) AS ultima_recepcion
     FROM detalle_recepcion_compra rd
     JOIN recepciones_compra r ON r.id_recepcion = rd.id_recepcion
     JOIN compras c ON c.id_compra = r.id_compra
     JOIN proveedores p ON p.id_proveedor = c.id_proveedor
     JOIN detalle_compra d ON d.id_detalle_compra = rd.id_detalle_compra
     JOIN productos pr ON pr.id_producto = d.id_producto
     WHERE 1 = 1 ${where}
     GROUP BY p.id_proveedor, p.nombre, pr.id_producto, pr.nombre
     ORDER BY p.nombre, pr.nombre`,
    parameters
  );
  return rows.map((row) => ({
    ...row,
    precio_promedio: Number(row.precio_promedio),
    precio_minimo: Number(row.precio_minimo),
    precio_maximo: Number(row.precio_maximo),
    ultimo_precio: Number(row.ultimo_precio),
    demora_promedio_dias: row.demora_promedio_dias === null
      ? null
      : Number(row.demora_promedio_dias)
  }));
}
