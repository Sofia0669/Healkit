exports.up = async (knex) => {
  await knex.schema.createTable('auditoria', (t) => {
    t.bigIncrements('id_auditoria').primary();
    t.integer('id_usuario').unsigned().nullable();
    t.string('tabla', 100).notNullable();
    t.string('accion', 30).notNullable();
    t.string('registro_id', 60);
    t.json('datos_anteriores');
    t.json('datos_nuevos');
    t.timestamp('fecha').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    t.foreign('id_usuario', 'fk_auditoria_usuario').references('usuarios.id_usuario').onDelete('SET NULL');
    t.index(['tabla','fecha'], 'idx_auditoria_tabla_fecha');
  });
};
exports.down = (knex) => knex.schema.dropTable('auditoria');
