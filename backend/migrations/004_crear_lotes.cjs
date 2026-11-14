exports.up = async (knex) => {
  await knex.schema.createTable('lotes', (t) => {
    t.increments('id_lote').primary();
    t.integer('id_producto').unsigned().notNullable();
    t.string('numero_lote', 80).notNullable();
    t.date('fecha_vencimiento').notNullable();
    t.integer('cantidad').notNullable().defaultTo(0);
    t.foreign('id_producto', 'fk_lote_producto').references('productos.id_producto');
    t.unique(['id_producto', 'numero_lote'], 'uq_lote_producto');
    t.index('fecha_vencimiento', 'idx_lotes_vencimiento');
  });
  await knex.raw('ALTER TABLE lotes ADD CONSTRAINT chk_lote_cantidad CHECK (cantidad >= 0)');
};
exports.down = (knex) => knex.schema.dropTable('lotes');
