exports.up = async (knex) => {
  await knex.schema.alterTable('proveedores', (t) => {
    t.string('contacto', 120).nullable();
    t.string('condiciones_pago', 180).nullable();
    t.integer('plazo_entrega_dias').unsigned().nullable();
  });

  await knex.schema.alterTable('compras', (t) => {
    t.date('fecha_entrega_prevista').nullable();
    t.timestamp('fecha_aprobacion').nullable();
    t.timestamp('fecha_recepcion').nullable();
    t.integer('id_usuario_aprobacion').unsigned().nullable();
    t.foreign('id_usuario_aprobacion', 'fk_compra_usuario_aprobacion')
      .references('usuarios.id_usuario').onDelete('SET NULL');
  });

  await knex.raw(
    `ALTER TABLE compras
     MODIFY estado ENUM('BORRADOR', 'SOLICITADA', 'PARCIAL', 'RECIBIDA', 'ANULADA')
     NOT NULL DEFAULT 'BORRADOR'`
  );

  await knex.schema.createTable('recepciones_compra', (t) => {
    t.increments('id_recepcion').primary();
    t.integer('id_compra').unsigned().notNullable();
    t.string('numero_factura', 80).notNullable();
    t.integer('id_usuario').unsigned().nullable();
    t.timestamp('fecha_recepcion').notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    t.decimal('total_factura', 12, 2).notNullable();
    t.foreign('id_compra', 'fk_recepcion_compra')
      .references('compras.id_compra');
    t.foreign('id_usuario', 'fk_recepcion_usuario')
      .references('usuarios.id_usuario').onDelete('SET NULL');
    t.index(['id_compra', 'fecha_recepcion'], 'idx_recepcion_compra_fecha');
  });

  await knex.schema.createTable('detalle_recepcion_compra', (t) => {
    t.increments('id_detalle_recepcion').primary();
    t.integer('id_recepcion').unsigned().notNullable();
    t.integer('id_detalle_compra').unsigned().notNullable();
    t.integer('cantidad').unsigned().notNullable();
    t.decimal('costo_unitario', 12, 2).notNullable();
    t.string('numero_lote', 80).notNullable();
    t.date('fecha_vencimiento').notNullable();
    t.foreign('id_recepcion', 'fk_detrec_recepcion')
      .references('recepciones_compra.id_recepcion');
    t.foreign('id_detalle_compra', 'fk_detrec_detalle_compra')
      .references('detalle_compra.id_detalle_compra');
    t.index('id_detalle_compra', 'idx_detrec_detalle_compra');
  });
  await knex.raw(
    `ALTER TABLE detalle_recepcion_compra
     ADD CONSTRAINT chk_detrec_cantidad CHECK (cantidad > 0)`
  );
  await knex.raw(
    `ALTER TABLE detalle_recepcion_compra
     ADD CONSTRAINT chk_detrec_costo CHECK (costo_unitario >= 0)`
  );
};

exports.down = async (knex) => {
  await knex.schema.dropTable('detalle_recepcion_compra');
  await knex.schema.dropTable('recepciones_compra');
  await knex.raw(
    `UPDATE compras SET estado = 'SOLICITADA' WHERE estado = 'PARCIAL'`
  );
  await knex.raw(
    `ALTER TABLE compras
     MODIFY estado ENUM('BORRADOR', 'SOLICITADA', 'RECIBIDA', 'ANULADA')
     NOT NULL DEFAULT 'BORRADOR'`
  );
  await knex.schema.alterTable('compras', (t) => {
    t.dropForeign('id_usuario_aprobacion', 'fk_compra_usuario_aprobacion');
    t.dropColumn('fecha_entrega_prevista');
    t.dropColumn('fecha_aprobacion');
    t.dropColumn('fecha_recepcion');
    t.dropColumn('id_usuario_aprobacion');
  });
  await knex.schema.alterTable('proveedores', (t) => {
    t.dropColumn('contacto');
    t.dropColumn('condiciones_pago');
    t.dropColumn('plazo_entrega_dias');
  });
};
