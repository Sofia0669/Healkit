exports.up = async (knex) => {
  await knex.schema.createTable('detalle_venta', (t) => {
    t.increments('id_detalle').primary();
    t.integer('id_venta').unsigned().notNullable();
    t.integer('id_producto').unsigned().notNullable();
    t.integer('cantidad').notNullable();
    t.decimal('precio_unitario', 12, 2).notNullable();
    t.decimal('subtotal', 12, 2).notNullable();
    t.foreign('id_venta', 'fk_detalle_venta').references('ventas.id_venta');
    t.foreign('id_producto', 'fk_detalle_producto').references('productos.id_producto');
  });
  await knex.raw('ALTER TABLE detalle_venta ADD CONSTRAINT chk_detalle_cantidad CHECK (cantidad > 0)');
  await knex.raw('ALTER TABLE detalle_venta ADD CONSTRAINT chk_detalle_montos CHECK (precio_unitario >= 0 AND subtotal >= 0)');
};
exports.down = (knex) => knex.schema.dropTable('detalle_venta');
