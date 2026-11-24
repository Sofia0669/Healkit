
import * as service from './auth.service.js';

// POST: Iniciar sesión.
export async function login(req, res, next) {
  try {
    const { correo, clave } = req.body || {};

    const resultado = await service.iniciarSesion(
      correo,
      clave
    );

    if (!resultado) {
      return res.status(401).json({
        mensaje: 'Correo o contraseña incorrectos'
      });
    }

    res.json(resultado);
  } catch (error) {
    next(error);
  }
}

// GET: Consultar sesión actual.
export async function perfil(req, res, next) {
  try {
    const usuario = await service.obtenerPerfil(
      req.usuario.id
    );

    if (!usuario) {
      return res.status(401).json({
        mensaje: 'Sesión no válida'
      });
    }

    res.json(usuario);
  } catch (error) {
    next(error);
  }
}

