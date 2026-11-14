exports.up = async (knex) => {
  await knex.schema.createTable('categorias', (t) => {
    t.increments('id_categoria').primary();
    t.string('nombre', 100).notNullable().unique();
    t.string('descripcion', 255);
  });
};
exports.down = (knex) => knex.schema.dropTable('categorias');
