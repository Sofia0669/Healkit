exports.seed = async (knex) => {
  await knex('categorias')
    .insert({
      nombre: 'Medicamentos',
      descripcion: 'Productos farmacéuticos de demostración'
    })
    .onConflict('nombre')
    .ignore();

  const categoria = await knex('categorias')
    .where({ nombre: 'Medicamentos' })
    .first();
  const proveedor = await knex('proveedores')
    .where({ nombre: 'Distribuidora de ejemplo' })
    .first();

  if (!categoria || !proveedor) {
    throw new Error(
      'No se encontró la categoría Medicamentos o el proveedor de ejemplo. Ejecuta primero 001_datos_prueba.'
    );
  }

  const catalogo = [
    ['HK-002', 'Acetaminofén 500 mg tableta', 'Tableta; registro de demostración.', 85, 150, 120, 20, false],
    ['HK-003', 'Ibuprofeno 400 mg tableta', 'Tableta; registro de demostración.', 120, 225, 100, 20, false],
    ['HK-004', 'Loratadina 10 mg tableta', 'Tableta; registro de demostración.', 95, 180, 75, 15, false],
    ['HK-005', 'Omeprazol 20 mg cápsula', 'Cápsula; registro de demostración.', 110, 210, 95, 15, false],
    ['HK-006', 'Amoxicilina 500 mg cápsula', 'Cápsula; registro de demostración.', 165, 320, 80, 15, true],
    ['HK-007', 'Azitromicina 500 mg tableta', 'Tableta; registro de demostración.', 290, 550, 40, 10, true],
    ['HK-008', 'Metformina 850 mg tableta', 'Tableta; registro de demostración.', 90, 170, 90, 20, true],
    ['HK-009', 'Losartán 50 mg tableta', 'Tableta; registro de demostración.', 130, 245, 75, 15, true],
    ['HK-010', 'Salbutamol 100 mcg inhalador', 'Inhalador; registro de demostración.', 1500, 2700, 20, 5, true],
    ['HK-011', 'Diclofenaco gel 1% 60 g', 'Gel tópico; registro de demostración.', 950, 1700, 18, 5, false],
    ['HK-012', 'Sales de rehidratación oral', 'Sobre; registro de demostración.', 275, 500, 45, 10, false],
    ['HK-013', 'Cetirizina 10 mg tableta', 'Tableta; registro de demostración.', 80, 150, 100, 20, false],
    ['HK-014', 'Naproxeno 250 mg tableta', 'Tableta; registro de demostración.', 135, 250, 60, 15, false],
    ['HK-015', 'Multivitamínico tableta', 'Tableta; registro de demostración.', 300, 550, 35, 10, false]
  ];

  await knex('productos')
    .insert(catalogo.map(([
      codigo,
      nombre,
      descripcion,
      precioCompra,
      precioVenta,
      stock,
      stockMinimo,
      requiereReceta
    ]) => ({
      codigo,
      nombre,
      descripcion,
      id_categoria: categoria.id_categoria,
      id_proveedor: proveedor.id_proveedor,
      precio_compra: precioCompra,
      precio_venta: precioVenta,
      stock_actual: stock,
      stock_minimo: stockMinimo,
      requiere_receta: requiereReceta,
      activo: true
    })))
    .onConflict('codigo')
    .ignore();
};
