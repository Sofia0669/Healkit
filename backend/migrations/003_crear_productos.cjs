exports.up = async (knex) => {
  await knex.schema.createTable('productos', (t) => {
    t.increments('id_producto').primary();
    t.string('codigo', 40).notNullable().unique();
    t.string('nombre', 150).notNullable();
    t.string('descripcion', 255);
    t.integer('id_categoria').unsigned().nullable();
    t.integer('id_proveedor').unsigned().nullable();
    t.decimal('precio_compra', 12, 2).notNullable().defaultTo(0);
    t.decimal('precio_venta', 12, 2).notNullable();
    t.integer('stock_actual').notNullable().defaultTo(0);
    t.integer('stock_minimo').notNullable().defaultTo(5);
    t.boolean('requiere_receta').notNullable().defaultTo(false);
    t.boolean('activo').notNullable().defaultTo(true);
    t.timestamp('creado_en').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    t.foreign('id_categoria', 'fk_producto_categoria').references('categorias.id_categoria').onDelete('SET NULL');
    t.foreign('id_proveedor', 'fk_producto_proveedor').references('proveedores.id_proveedor').onDelete('SET NULL');
    t.index('nombre', 'idx_productos_nombre');
  });
  await knex.raw('ALTER TABLE productos ADD CONSTRAINT chk_producto_precio_compra CHECK (precio_compra >= 0)');
  await knex.raw('ALTER TABLE productos ADD CONSTRAINT chk_producto_precio_venta CHECK (precio_venta >= 0)');
  await knex.raw('ALTER TABLE productos ADD CONSTRAINT chk_producto_stock CHECK (stock_actual >= 0 AND stock_minimo >= 0)');
};
exports.down = (knex) => knex.schema.dropTable('productos');
