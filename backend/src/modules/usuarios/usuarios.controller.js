
import * as service from './usuarios.service.js';

// Manejar errores de forma sencilla.
function manejarError(error, res, next) {
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      mensaje: 'El correo ya está registrado'
    });
  }

  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      mensaje: 'El rol seleccionado no existe'
    });
  }

  if (error.estado) {
    return res.status(error.estado).json({
      mensaje: error.message
    });
  }

  next(error);
}

// GET - Listar usuarios.
export async function listar(req, res, next) {
  try {
    const usuarios = await service.listar();
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
}

// GET - Listar roles.
export async function listarRoles(req, res, next) {
  try {
    const roles = await service.listarRoles();
    res.json(roles);
  } catch (error) {
    next(error);
  }
}

// POST - Registrar usuario.
export async function crear(req, res, next) {
  try {
    const usuario = await service.crear(req.body);

    res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario
    });
  } catch (error) {
    manejarError(error, res, next);
  }
}

// PATCH - Cambiar rol.
export async function cambiarRol(req, res, next) {
  try {
    const usuario = await service.cambiarRol(
      req.params.id,
      req.body?.idRol,
      req.usuario
    );

    res.json({
      mensaje: 'Rol actualizado correctamente',
      usuario
    });
  } catch (error) {
    manejarError(error, res, next);
  }
}

// PATCH - Activar o desactivar.
export async function cambiarEstado(req, res, next) {
  try {
    const usuario = await service.cambiarEstado(
      req.params.id,
      req.body?.activo,
      req.usuario
    );

    res.json({
      mensaje: 'Estado actualizado correctamente',
      usuario
    });
  } catch (error) {
    manejarError(error, res, next);
  }
}
