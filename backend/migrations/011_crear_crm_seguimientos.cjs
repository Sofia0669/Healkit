exports.up = async (knex) => {
  await knex.schema.createTable('seguimientos_clientes', (t) => {
    t.increments('id_seguimiento').primary();
    t.integer('id_cliente').unsigned().notNullable();
    t.integer('id_usuario').unsigned().nullable();
    t.enu('tipo', ['CONSULTA', 'LLAMADA', 'MENSAJE', 'RECLAMO', 'OTRO']).notNullable();
    t.string('descripcion', 1000).notNullable();
    t.timestamp('fecha').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    t.date('fecha_proximo_contacto');
    t.foreign('id_cliente', 'fk_seguimiento_cliente').references('clientes.id_cliente');
    t.foreign('id_usuario', 'fk_seguimiento_usuario').references('usuarios.id_usuario').onDelete('SET NULL');
    t.index(['id_cliente', 'fecha'], 'idx_seguimiento_cliente_fecha');
  });
};
exports.down = (knex) => knex.schema.dropTable('seguimientos_clientes');
