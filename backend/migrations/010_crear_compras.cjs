exports.up = async (knex) => {
  await knex.schema.createTable('compras', (t) => {
    t.increments('id_compra').primary();
    t.integer('id_proveedor').unsigned().notNullable();
    t.integer('id_usuario').unsigned().nullable();
    t.dateTime('fecha').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    t.enu('estado', ['BORRADOR', 'SOLICITADA', 'RECIBIDA', 'ANULADA']).notNullable().defaultTo('BORRADOR');
    t.decimal('total', 12, 2).notNullable().defaultTo(0);
    t.string('observaciones', 500);
    t.foreign('id_proveedor', 'fk_compra_proveedor').references('proveedores.id_proveedor');
    t.foreign('id_usuario', 'fk_compra_usuario').references('usuarios.id_usuario').onDelete('SET NULL');
    t.index('fecha', 'idx_compras_fecha');
  });
  await knex.schema.createTable('detalle_compra', (t) => {
    t.increments('id_detalle_compra').primary();
    t.integer('id_compra').unsigned().notNullable();
    t.integer('id_producto').unsigned().notNullable();
    t.integer('cantidad').unsigned().notNullable();
    t.decimal('costo_unitario', 12, 2).notNullable();
    t.decimal('subtotal', 12, 2).notNullable();
    t.foreign('id_compra', 'fk_dcomp_compra').references('compras.id_compra');
    t.foreign('id_producto', 'fk_dcomp_producto').references('productos.id_producto');
  });
  await knex.raw('ALTER TABLE compras ADD CONSTRAINT chk_compra_total CHECK (total >= 0)');
  await knex.raw('ALTER TABLE detalle_compra ADD CONSTRAINT chk_dcomp_cantidad CHECK (cantidad > 0)');
  await knex.raw('ALTER TABLE detalle_compra ADD CONSTRAINT chk_dcomp_montos CHECK (costo_unitario >= 0 AND subtotal >= 0)');
};
exports.down = async (knex) => {
  await knex.schema.dropTable('detalle_compra');
  await knex.schema.dropTable('compras');
};
