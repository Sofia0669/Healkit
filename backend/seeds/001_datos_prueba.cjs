exports.seed = async (knex) => {
  await knex('categorias').insert({ nombre: 'Medicamentos', descripcion: 'Productos farmacéuticos' })
    .onConflict('nombre').ignore();
  const categoria = await knex('categorias').where({ nombre: 'Medicamentos' }).first();
  const existeProveedor = await knex('proveedores').where({ nombre: 'Distribuidora de ejemplo' }).first();
  if (!existeProveedor) await knex('proveedores').insert({ nombre: 'Distribuidora de ejemplo', telefono: '8888-0000', correo: 'ejemplo@proveedor.test' });
  const proveedor = await knex('proveedores').where({ nombre: 'Distribuidora de ejemplo' }).first();
  await knex('productos').insert({ codigo: 'HK-001', nombre: 'Paracetamol 500 mg (ejemplo)', id_categoria: categoria.id_categoria, id_proveedor: proveedor.id_proveedor, precio_compra: 600, precio_venta: 1200, stock_actual: 30, stock_minimo: 10 }).onConflict('codigo').ignore();
  await knex('clientes').insert({ identificacion: 'DEMO-001', nombre: 'Cliente de prueba', telefono: '8888-1111' }).onConflict('identificacion').ignore();
};
