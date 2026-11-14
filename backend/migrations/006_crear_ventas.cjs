exports.up = async (knex) => {
  await knex.schema.createTable('ventas', (t) => {
    t.increments('id_venta').primary();
    t.integer('id_cliente').unsigned().nullable();
    t.dateTime('fecha').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    t.decimal('subtotal', 12, 2).notNullable().defaultTo(0);
    t.decimal('impuesto', 12, 2).notNullable().defaultTo(0);
    t.decimal('total', 12, 2).notNullable().defaultTo(0);
    t.enu('metodo_pago', ['EFECTIVO', 'TARJETA', 'SINPE', 'OTRO']).notNullable().defaultTo('EFECTIVO');
    t.enu('estado', ['PENDIENTE', 'COMPLETADA', 'ANULADA']).notNullable().defaultTo('PENDIENTE');
    t.foreign('id_cliente', 'fk_venta_cliente').references('clientes.id_cliente').onDelete('SET NULL');
    t.index('fecha', 'idx_ventas_fecha');
  });
  await knex.raw('ALTER TABLE ventas ADD CONSTRAINT chk_venta_montos CHECK (subtotal >= 0 AND impuesto >= 0 AND total >= 0)');
};
exports.down = (knex) => knex.schema.dropTable('ventas');
