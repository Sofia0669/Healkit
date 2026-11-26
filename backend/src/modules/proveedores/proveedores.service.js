import * as model from './proveedores.model.js';

function errorValidacion(mensaje) {
  const error = new Error(mensaje);
  error.status = 400;
  return error;
}

function texto(valor, campo, maximo, obligatorio = false) {
  const resultado = String(valor ?? '').trim();
  if (obligatorio && !resultado) {
    throw errorValidacion(`${campo} es obligatorio`);
  }
  if (resultado.length > maximo) {
    throw errorValidacion(`${campo} supera el máximo de ${maximo} caracteres`);
  }
  return resultado || null;
}

function entero(valor, campo, minimo, maximo = Number.MAX_SAFE_INTEGER) {
  const numero = Number(valor);
  if (!Number.isSafeInteger(numero) || numero < minimo || numero > maximo) {
    throw errorValidacion(`${campo} debe ser un número entero válido`);
  }
  return numero;
}

function fecha(valor, campo) {
  if (valor == null || valor === '') return null;
  const resultado = String(valor);
  const parsed = new Date(`${resultado}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(resultado) ||
      Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== resultado) {
    throw errorValidacion(`${campo} debe ser una fecha válida`);
  }
  return resultado;
}

function validarProveedor(datos) {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    throw errorValidacion('Datos de proveedor inválidos');
  }
  const plazo = datos.plazoEntregaDias == null || datos.plazoEntregaDias === ''
    ? null
    : entero(datos.plazoEntregaDias, 'Plazo de entrega', 0, 365);
  const correo = texto(datos.correo, 'Correo', 150);
  if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    throw errorValidacion('El correo del proveedor no es válido');
  }
  return {
    nombre: texto(datos.nombre, 'Nombre', 150, true),
    identificacion: texto(datos.identificacion, 'Identificación', 30),
    telefono: texto(datos.telefono, 'Teléfono', 30),
    correo,
    direccion: texto(datos.direccion, 'Dirección', 255),
    contacto: texto(datos.contacto, 'Persona de contacto', 120),
    condicionesPago: texto(datos.condicionesPago, 'Condiciones de pago', 180),
    plazoEntregaDias: plazo,
    activo: datos.activo === false || datos.activo === 0 ? 0 : 1
  };
}

function validarCompra(datos) {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    throw errorValidacion('Datos de orden inválidos');
  }
  if (!Array.isArray(datos.items) || datos.items.length === 0) {
    throw errorValidacion('Agrega al menos un producto a la orden');
  }
  const items = datos.items.map((item) => {
    const cantidad = entero(item.cantidad, 'Cantidad solicitada', 1, 1000000);
    const idProducto = entero(item.idProducto, 'Producto', 1);
    const costoUnitario = Number(item.costoUnitario);
    if (!Number.isFinite(costoUnitario) || costoUnitario < 0 ||
        costoUnitario > 9999999999) {
      throw errorValidacion('El costo unitario debe ser válido y no negativo');
    }
    return { idProducto, cantidad, costoUnitario };
  });
  if (new Set(items.map((item) => item.idProducto)).size !== items.length) {
    throw errorValidacion('No repitas un producto en la orden');
  }
  return {
    idProveedor: entero(datos.idProveedor, 'Proveedor', 1),
    fechaEntregaPrevista: fecha(datos.fechaEntregaPrevista, 'Entrega prevista'),
    observaciones: texto(datos.observaciones, 'Observaciones', 500),
    items
  };
}

function validarRecepcion(datos) {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    throw errorValidacion('Datos de recepción inválidos');
  }
  if (!Array.isArray(datos.items) || datos.items.length === 0) {
    throw errorValidacion('Registra al menos un producto recibido');
  }
  const items = datos.items.map((item) => {
    const costoUnitario = Number(item.costoUnitario);
    if (!Number.isFinite(costoUnitario) || costoUnitario < 0 ||
        costoUnitario > 9999999999) {
      throw errorValidacion('El costo facturado debe ser válido y no negativo');
    }
    return {
      idDetalleCompra: entero(item.idDetalleCompra, 'Línea de orden', 1),
      cantidad: entero(item.cantidad, 'Cantidad recibida', 1, 1000000),
      costoUnitario,
      numeroLote: texto(item.numeroLote, 'Número de lote', 80, true),
      fechaVencimiento: fecha(item.fechaVencimiento, 'Fecha de vencimiento')
    };
  });
  if (items.some((item) => !item.fechaVencimiento)) {
    throw errorValidacion('La fecha de vencimiento es obligatoria para cada lote');
  }
  if (new Set(items.map((item) => item.idDetalleCompra)).size !== items.length) {
    throw errorValidacion('No repitas una línea de orden en la recepción');
  }
  const totalFactura = Number(datos.totalFactura);
  if (!Number.isFinite(totalFactura) || totalFactura < 0 ||
      totalFactura > 9999999999) {
    throw errorValidacion('El total de la factura debe ser válido y no negativo');
  }
  return {
    totalFactura,
    items
  };
}

export async function listarProveedores() {
  return model.listarProveedores();
}

export async function guardarProveedor(id, datos) {
  const proveedor = validarProveedor(datos);
  return id
    ? model.actualizarProveedor(entero(id, 'Proveedor', 1), proveedor)
    : model.crearProveedor(proveedor);
}

export async function listarCatalogo() {
  return model.listarCatalogo();
}

export async function listarCompras() {
  return model.listarCompras();
}

export async function obtenerCompra(id) {
  return model.obtenerCompra(entero(id, 'Orden', 1));
}

export async function crearCompra(datos, usuarioId) {
  return model.crearCompra(validarCompra(datos), usuarioId);
}

export async function aprobarCompra(id, usuarioId) {
  return model.aprobarCompra(entero(id, 'Orden', 1), usuarioId);
}

export async function recibirCompra(id, datos, usuarioId) {
  return model.recibirCompra(
    entero(id, 'Orden', 1),
    validarRecepcion(datos),
    usuarioId
  );
}

export async function historialPrecios(idProveedor) {
  const id = idProveedor == null || idProveedor === ''
    ? null
    : entero(idProveedor, 'Proveedor', 1);
  return model.historialPrecios(id);
}
