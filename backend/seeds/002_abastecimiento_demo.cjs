function fechaRelativa(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

exports.seed = async (knex) => knex.transaction(async (trx) => {
  const proveedoresSeed = [
    {
      nombre: 'Distribuidora Médica CR',
      identificacion: 'SEED-PROV-001',
      telefono: '2222-0101',
      correo: 'ventas@distribuidora.test',
      direccion: 'San José, Costa Rica',
      contacto: 'Equipo de ventas',
      condiciones_pago: 'Crédito a 30 días',
      plazo_entrega_dias: 3
    },
    {
      nombre: 'Farmacéutica del Caribe',
      identificacion: 'SEED-PROV-002',
      telefono: '2222-0202',
      correo: 'pedidos@farmaceutica.test',
      direccion: 'Limón, Costa Rica',
      contacto: 'Atención comercial',
      condiciones_pago: 'Contado contra factura',
      plazo_entrega_dias: 5
    }
  ];

  const proveedores = [];
  for (const datos of proveedoresSeed) {
    let proveedor = await trx('proveedores')
      .where({ identificacion: datos.identificacion })
      .first();
    if (!proveedor) {
      const [id] = await trx('proveedores').insert(datos);
      proveedor = { id_proveedor: id };
    } else {
      await trx('proveedores')
        .where({ id_proveedor: proveedor.id_proveedor })
        .update(datos);
    }
    proveedores.push(proveedor);
  }

  const producto = await trx('productos')
    .where({ codigo: 'HK-001', activo: 1 })
    .first();
  if (!producto) {
    throw new Error(
      'No se encontró el producto HK-001. Ejecuta primero el seed 001_datos_prueba.'
    );
  }

  const observacionRecibida =
    'SEED_ABASTECIMIENTO: recepción de demostración';
  let compraRecibida = await trx('compras')
    .where({ observaciones: observacionRecibida })
    .first();
  if (!compraRecibida) {
    const [idCompra] = await trx('compras').insert({
      id_proveedor: proveedores[0].id_proveedor,
      fecha_entrega_prevista: fechaRelativa(-2),
      estado: 'RECIBIDA',
      total: 12000,
      observaciones: observacionRecibida,
      fecha_aprobacion: trx.fn.now(),
      fecha_recepcion: trx.fn.now()
    });
    const [idDetalle] = await trx('detalle_compra').insert({
      id_compra: idCompra,
      id_producto: producto.id_producto,
      cantidad: 20,
      costo_unitario: 600,
      subtotal: 12000
    });
    const [idRecepcion] = await trx('recepciones_compra').insert({
      id_compra: idCompra,
      numero_factura: 'FAC-DEMO-001',
      total_factura: 12500
    });

    const numeroLote = 'SEED-HEALKIT-001';
    let lote = await trx('lotes')
      .where({
        id_producto: producto.id_producto,
        numero_lote: numeroLote
      })
      .first();
    let idLote;
    if (!lote) {
      [idLote] = await trx('lotes').insert({
        id_producto: producto.id_producto,
        numero_lote: numeroLote,
        fecha_vencimiento: fechaRelativa(365),
        cantidad: 20
      });
    } else {
      idLote = lote.id_lote;
      await trx('lotes').where({ id_lote: idLote }).increment('cantidad', 20);
    }

    await trx('detalle_recepcion_compra').insert({
      id_recepcion: idRecepcion,
      id_detalle_compra: idDetalle,
      cantidad: 20,
      costo_unitario: 625,
      numero_lote: numeroLote,
      fecha_vencimiento: fechaRelativa(365)
    });
    await trx('productos')
      .where({ id_producto: producto.id_producto })
      .update({
        precio_compra: 625,
        stock_actual: trx.raw('stock_actual + 20')
      });
    await trx('movimientos_inventario').insert({
      id_producto: producto.id_producto,
      id_lote: idLote,
      tipo: 'ENTRADA',
      cantidad: 20,
      motivo: 'Recepción factura FAC-DEMO-001',
      id_compra: idCompra
    });
  }

  const observacionPendiente =
    'SEED_ABASTECIMIENTO: orden aprobada de demostración';
  let compraPendiente = await trx('compras')
    .where({ observaciones: observacionPendiente })
    .first();
  if (!compraPendiente) {
    const [idCompra] = await trx('compras').insert({
      id_proveedor: proveedores[1].id_proveedor,
      fecha_entrega_prevista: fechaRelativa(5),
      estado: 'SOLICITADA',
      total: 8400,
      observaciones: observacionPendiente,
      fecha_aprobacion: trx.fn.now()
    });
    await trx('detalle_compra').insert({
      id_compra: idCompra,
      id_producto: producto.id_producto,
      cantidad: 12,
      costo_unitario: 700,
      subtotal: 8400
    });
  }
});
