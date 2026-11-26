
import * as service from './inventario.service.js';

export async function listar(req, res, next) {
  try {
    const productos = await service.listar();
    res.json(productos);
  } catch (error) {
    next(error);
  }
}

export async function obtener(req, res, next) {
  try {
    const producto = await service.buscar(Number(req.params.id));

    if (!producto) {
      return res.status(404).json({
        mensaje: 'Producto no encontrado'
      });
    }

    res.json(producto);
  } catch (error) {
    next(error);
  }
}

export async function crear(req, res, next) {
  try {
    const producto = await service.crear(req.body);
    res.status(201).json(producto);
  } catch (error) {
    responderError(error, res, next);
  }
}

export async function actualizar(req, res, next) {
  try {
    const producto = await service.actualizar(
      Number(req.params.id),
      req.body
    );

    if (!producto) {
      return res.status(404).json({
        mensaje: 'Producto no encontrado'
      });
    }

    res.json(producto);
  } catch (error) {
    responderError(error, res, next);
  }
}

export async function eliminar(req, res, next) {
  try {
    const eliminado = await service.eliminar(
      Number(req.params.id)
    );

    if (!eliminado) {
      return res.status(404).json({
        mensaje: 'Producto no encontrado'
      });
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

function responderError(error, res, next) {
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      mensaje: 'El código del producto ya existe'
    });
  }

  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      mensaje: 'La categoría o proveedor no existe'
    });
  }

  if (!error.code && error.message) {
    return res.status(400).json({
      mensaje: error.message
    });
  }

  next(error);
}

export async function listarCategorias(req, res, next) {
  try {
    const categorias = await service.obtenerCategorias();

    return res.json({ categorias });
  } catch (error) {
    next(error);
  }
}

export async function listarProveedores(req, res, next) {
  try {
    const proveedores = await service.obtenerProveedores();

    return res.json({ proveedores });
  } catch (error) {
    next(error);
  }
}
