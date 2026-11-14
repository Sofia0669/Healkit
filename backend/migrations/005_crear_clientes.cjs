exports.up = async (knex) => {
  await knex.schema.createTable('clientes', (t) => {
    t.increments('id_cliente').primary();
    t.string('identificacion', 30).unique();
    t.string('nombre', 150).notNullable();
    t.string('telefono', 30);
    t.string('correo', 150);
    t.string('direccion', 255);
    t.timestamp('fecha_registro').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    t.boolean('activo').notNullable().defaultTo(true);
  });
};
exports.down = (knex) => knex.schema.dropTable('clientes');
