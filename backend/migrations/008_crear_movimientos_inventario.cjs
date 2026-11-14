exports.up = async (knex) => {
  await knex.schema.createTable('movimientos_inventario', (t) => {
    t.increments('id_movimiento').primary();
    t.integer('id_producto').unsigned().notNullable();
    t.integer('id_lote').unsigned().nullable();
    t.enu('tipo', ['ENTRADA', 'SALIDA', 'AJUSTE']).notNullable();
    t.integer('cantidad').notNullable();
    t.string('motivo', 255);
    t.integer('id_venta').unsigned().nullable();
    t.timestamp('fecha').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    t.foreign('id_producto', 'fk_mov_producto').references('productos.id_producto');
    t.foreign('id_lote', 'fk_mov_lote').references('lotes.id_lote');
    t.foreign('id_venta', 'fk_mov_venta').references('ventas.id_venta');
    t.index('fecha', 'idx_movimientos_fecha');
  });
  await knex.raw('ALTER TABLE movimientos_inventario ADD CONSTRAINT chk_mov_cantidad CHECK (cantidad > 0)');
};
exports.down = (knex) => knex.schema.dropTable('movimientos_inventario');
