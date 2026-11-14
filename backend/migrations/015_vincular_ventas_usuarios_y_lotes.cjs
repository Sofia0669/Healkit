exports.up = async (knex) => {
  await knex.schema.alterTable('ventas', (t) => {
    t.integer('id_usuario').unsigned().nullable();
    t.foreign('id_usuario', 'fk_venta_usuario').references('usuarios.id_usuario').onDelete('SET NULL');
  });
  await knex.schema.alterTable('detalle_venta', (t) => {
    t.integer('id_lote').unsigned().nullable();
    t.foreign('id_lote', 'fk_detalle_lote').references('lotes.id_lote').onDelete('SET NULL');
  });
  await knex.schema.alterTable('movimientos_inventario', (t) => {
    t.integer('id_usuario').unsigned().nullable();
    t.integer('id_compra').unsigned().nullable();
    t.foreign('id_usuario', 'fk_mov_usuario').references('usuarios.id_usuario').onDelete('SET NULL');
    t.foreign('id_compra', 'fk_mov_compra').references('compras.id_compra').onDelete('SET NULL');
  });
};
exports.down = async (knex) => {
  await knex.schema.alterTable('movimientos_inventario', (t) => {
    t.dropForeign('id_compra', 'fk_mov_compra');
    t.dropForeign('id_usuario', 'fk_mov_usuario');
    t.dropColumn('id_compra');
    t.dropColumn('id_usuario');
  });
  await knex.schema.alterTable('detalle_venta', (t) => {
    t.dropForeign('id_lote', 'fk_detalle_lote');
    t.dropColumn('id_lote');
  });
  await knex.schema.alterTable('ventas', (t) => {
    t.dropForeign('id_usuario', 'fk_venta_usuario');
    t.dropColumn('id_usuario');
  });
};
