exports.up = async (knex) => {
  await knex.schema.createTable('cuentas_contables', (t) => {
    t.increments('id_cuenta').primary();
    t.string('codigo', 30).notNullable().unique();
    t.string('nombre', 150).notNullable();
    t.enu('tipo', ['ACTIVO', 'PASIVO', 'PATRIMONIO', 'INGRESO', 'GASTO']).notNullable();
    t.integer('id_cuenta_padre').unsigned().nullable();
    t.boolean('activa').notNullable().defaultTo(true);
    t.foreign('id_cuenta_padre', 'fk_cuenta_padre').references('cuentas_contables.id_cuenta').onDelete('SET NULL');
  });
  await knex.schema.createTable('asientos_contables', (t) => {
    t.increments('id_asiento').primary();
    t.date('fecha').notNullable();
    t.string('descripcion', 500).notNullable();
    t.enu('estado', ['BORRADOR', 'CONTABILIZADO', 'ANULADO']).notNullable().defaultTo('BORRADOR');
    t.integer('id_usuario').unsigned().nullable();
    t.integer('id_venta').unsigned().nullable();
    t.integer('id_compra').unsigned().nullable();
    t.foreign('id_usuario', 'fk_asiento_usuario').references('usuarios.id_usuario').onDelete('SET NULL');
    t.foreign('id_venta', 'fk_asiento_venta').references('ventas.id_venta').onDelete('SET NULL');
    t.foreign('id_compra', 'fk_asiento_compra').references('compras.id_compra').onDelete('SET NULL');
    t.index('fecha', 'idx_asientos_fecha');
  });
  await knex.schema.createTable('detalle_asiento', (t) => {
    t.increments('id_detalle_asiento').primary();
    t.integer('id_asiento').unsigned().notNullable();
    t.integer('id_cuenta').unsigned().notNullable();
    t.decimal('debe', 14, 2).notNullable().defaultTo(0);
    t.decimal('haber', 14, 2).notNullable().defaultTo(0);
    t.foreign('id_asiento', 'fk_dasiento_asiento').references('asientos_contables.id_asiento');
    t.foreign('id_cuenta', 'fk_dasiento_cuenta').references('cuentas_contables.id_cuenta');
  });
  await knex.raw('ALTER TABLE detalle_asiento ADD CONSTRAINT chk_asiento_importes CHECK (debe >= 0 AND haber >= 0 AND NOT (debe > 0 AND haber > 0))');
};
exports.down = async (knex) => {
  await knex.schema.dropTable('detalle_asiento');
  await knex.schema.dropTable('asientos_contables');
  await knex.schema.dropTable('cuentas_contables');
};
