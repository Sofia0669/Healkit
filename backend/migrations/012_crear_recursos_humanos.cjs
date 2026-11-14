exports.up = async (knex) => {
  await knex.schema.createTable('puestos', (t) => {
    t.increments('id_puesto').primary();
    t.string('nombre', 120).notNullable().unique();
    t.string('descripcion', 255);
  });
  await knex.schema.createTable('empleados', (t) => {
    t.increments('id_empleado').primary();
    t.integer('id_puesto').unsigned().nullable();
    t.integer('id_usuario').unsigned().nullable().unique();
    t.string('identificacion', 30).notNullable().unique();
    t.string('nombre', 150).notNullable();
    t.string('telefono', 30);
    t.string('correo', 150);
    t.date('fecha_ingreso').notNullable();
    t.decimal('salario_base', 12, 2).notNullable().defaultTo(0);
    t.boolean('activo').notNullable().defaultTo(true);
    t.foreign('id_puesto', 'fk_empleado_puesto').references('puestos.id_puesto').onDelete('SET NULL');
    t.foreign('id_usuario', 'fk_empleado_usuario').references('usuarios.id_usuario').onDelete('SET NULL');
  });
  await knex.schema.createTable('asistencias', (t) => {
    t.increments('id_asistencia').primary();
    t.integer('id_empleado').unsigned().notNullable();
    t.date('fecha').notNullable();
    t.dateTime('entrada');
    t.dateTime('salida');
    t.enu('estado', ['PRESENTE', 'AUSENTE', 'JUSTIFICADA']).notNullable().defaultTo('PRESENTE');
    t.foreign('id_empleado', 'fk_asistencia_empleado').references('empleados.id_empleado');
    t.unique(['id_empleado', 'fecha'], 'uq_asistencia_empleado_fecha');
  });
  await knex.schema.createTable('planillas', (t) => {
    t.increments('id_planilla').primary();
    t.date('periodo_inicio').notNullable();
    t.date('periodo_fin').notNullable();
    t.enu('estado', ['BORRADOR', 'APROBADA', 'PAGADA']).notNullable().defaultTo('BORRADOR');
    t.dateTime('creada_en').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
  });
  await knex.schema.createTable('detalle_planilla', (t) => {
    t.increments('id_detalle_planilla').primary();
    t.integer('id_planilla').unsigned().notNullable();
    t.integer('id_empleado').unsigned().notNullable();
    t.decimal('salario_bruto', 12, 2).notNullable().defaultTo(0);
    t.decimal('deducciones', 12, 2).notNullable().defaultTo(0);
    t.decimal('salario_neto', 12, 2).notNullable().defaultTo(0);
    t.foreign('id_planilla', 'fk_detplan_planilla').references('planillas.id_planilla');
    t.foreign('id_empleado', 'fk_detplan_empleado').references('empleados.id_empleado');
    t.unique(['id_planilla','id_empleado'], 'uq_planilla_empleado');
  });
  await knex.raw('ALTER TABLE empleados ADD CONSTRAINT chk_empleado_salario CHECK (salario_base >= 0)');
  await knex.raw('ALTER TABLE detalle_planilla ADD CONSTRAINT chk_planilla_montos CHECK (salario_bruto >= 0 AND deducciones >= 0 AND salario_neto >= 0)');
};
exports.down = async (knex) => {
  await knex.schema.dropTable('detalle_planilla');
  await knex.schema.dropTable('planillas');
  await knex.schema.dropTable('asistencias');
  await knex.schema.dropTable('empleados');
  await knex.schema.dropTable('puestos');
};
