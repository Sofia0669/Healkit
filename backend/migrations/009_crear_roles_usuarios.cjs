exports.up = async (knex) => {
  await knex.schema.createTable('roles', (t) => {
    t.increments('id_rol').primary();
    t.string('nombre', 60).notNullable().unique();
    t.string('descripcion', 255);
  });
  await knex.schema.createTable('usuarios', (t) => {
    t.increments('id_usuario').primary();
    t.integer('id_rol').unsigned().notNullable();
    t.string('nombre', 150).notNullable();
    t.string('correo', 150).notNullable().unique();
    t.string('password_hash', 255).notNullable();
    t.boolean('activo').notNullable().defaultTo(true);
    t.timestamp('creado_en').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    t.foreign('id_rol', 'fk_usuario_rol').references('roles.id_rol');
  });
};
exports.down = async (knex) => {
  await knex.schema.dropTable('usuarios');
  await knex.schema.dropTable('roles');
};
