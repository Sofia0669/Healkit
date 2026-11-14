exports.up = async (knex) => {
  await knex.schema.createTable('proveedores', (t) => {
    t.increments('id_proveedor').primary();
    t.string('nombre', 150).notNullable();
    t.string('identificacion', 30).unique();
    t.string('telefono', 30);
    t.string('correo', 150);
    t.string('direccion', 255);
    t.boolean('activo').notNullable().defaultTo(true);
  });
};
exports.down = (knex) => knex.schema.dropTable('proveedores');
