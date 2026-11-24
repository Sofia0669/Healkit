
import jwt from 'jsonwebtoken';
import { buscarPorId } from '../modules/auth/auth.repository.js';

export async function autenticar(req, res, next) {
  const autorizacion = req.headers.authorization || '';

  if (!autorizacion.startsWith('Bearer ')) {
    return res.status(401).json({
      mensaje: 'Debes iniciar sesión'
    });
  }

  const token = autorizacion.slice(7);

  try {
    if (!process.env.JWT_SECRET ||
        process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET no está configurado');
    }

    const datos = jwt.verify(
      token,
      process.env.JWT_SECRET,
      {
        algorithms: ['HS256'],
        issuer: 'healkit-api',
        audience: 'healkit-frontend'
      }
    );

    const id = Number(datos.sub);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(401).json({
        mensaje: 'Token inválido'
      });
    }

    const usuario = await buscarPorId(id);

    if (!usuario) {
      return res.status(401).json({
        mensaje: 'Usuario inactivo o inexistente'
      });
    }

    req.usuario = {
      id: usuario.id_usuario,
      rol: usuario.rol
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        mensaje: 'Tu sesión ha expirado'
      });
    }

    if (error.name === 'JsonWebTokenError' ||
        error.name === 'NotBeforeError') {
      return res.status(401).json({
        mensaje: 'Token inválido'
      });
    }

    next(error);
  }
}
