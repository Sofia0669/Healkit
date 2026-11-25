# Cadena de suministros y proveedores

Las rutas de este módulo requieren sesión y los roles `Administrador General` o
`Encargado de Farmacia`.

| Método | Ruta | Función |
| --- | --- | --- |
| GET, POST | `/api/proveedores` | Consultar y registrar proveedores |
| PUT | `/api/proveedores/:id` | Actualizar datos o desactivar proveedor |
| GET | `/api/proveedores/catalogo` | Listar proveedores y productos activos |
| GET, POST | `/api/proveedores/compras` | Consultar y emitir órdenes en borrador |
| GET | `/api/proveedores/compras/:id` | Consultar una orden y sus recepciones |
| POST | `/api/proveedores/compras/:id/aprobar` | Aprobar y enviar una orden |
| POST | `/api/proveedores/compras/:id/recepciones` | Validar factura y registrar mercadería |
| GET | `/api/proveedores/historial-precios` | Consultar precio y tiempo de entrega históricos |

La recepción es transaccional: valida los saldos de la orden, genera un número
interno de factura (`FAC-año-secuencia`), registra cantidades, costos y lotes,
genera movimientos de entrada y actualiza las existencias. Una factura que no
coincide con el costo de las líneas queda registrada con la diferencia visible
para revisión.

La migración `016_ampliar_abastecimiento.cjs` agrega condiciones comerciales,
aprobaciones y el historial de recepciones. Desde `backend/`, ejecutar antes de
iniciar el módulo:

```sh
npx knex migrate:latest --knexfile knexfile.cjs --env development
npx knex seed:run --knexfile knexfile.cjs --env development
```

El seed `002_abastecimiento_demo.cjs` es idempotente y registra proveedores,
una orden aprobada pendiente y una orden recibida con factura, lote e historial
para probar la pantalla.

El seed `003_medicamentos_demo.cjs` agrega catorce productos de catálogo
ficticios, con precios y existencias iniciales, para pruebas de inventario y
órdenes de compra.
