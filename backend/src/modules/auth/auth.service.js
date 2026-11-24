
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { Usuario } from './auth.model.js';
import * as repository from './auth.repository.js';

// Comprobar credenciales y generar el token.
export async function iniciarSesion(correo, clave) {
  if (typeof correo !== 'string' ||
      typeof clave !== 'string' ||
      !correo.trim() ||
      !clave) {
    return null;
  }

  const usuarioBD = await repository.buscarPorCorreo(
    correo.trim().toLowerCase()
  );

  // No revelar si el correo existe.
  if (!usuarioBD || !usuarioBD.activo) {
    return null;
  }

  const esCorrecta = await bcrypt.compare(
    clave,
    usuarioBD.password_hash
  );

  if (!esCorrecta) {
    return null;
  }

  const usuario = new Usuario(usuarioBD);

  if (!process.env.JWT_SECRET ||
      process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET no está configurado');
  }

  const token = jwt.sign(
    { rol: usuario.rol },
    process.env.JWT_SECRET,
    {
      subject: String(usuario.id),
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      algorithm: 'HS256',
      issuer: 'healkit-api',
      audience: 'healkit-frontend'
    }
  );

  return { token, usuario };
}

// Obtener información del usuario autenticado.
export async function obtenerPerfil(id) {
  const datos = await repository.buscarPorId(id);

  return datos ? new Usuario(datos) : null;
}


export async function registrar(nombre, correo, clave) {

  // Validar tipos de datos
  if (
    typeof nombre !== 'string' ||
    typeof correo !== 'string' ||
    typeof clave !== 'string'
  ) {
    throw new Error('Datos de registro inválidos');
  }

  nombre = nombre.trim();
  correo = correo.trim().toLowerCase();

  // Verificar campos obligatorios
  if (!nombre || !correo || !clave) {
    throw new Error('Todos los campos son obligatorios');
  }

  // Validar longitud de los campos
  if (nombre.length > 150 || correo.length > 254) {
    throw new Error('Nombre o correo demasiado largo');
  }

  // Validar correo
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    throw new Error('El correo no es válido');
  }

  // Validar contraseña
  if (clave.length < 12 || clave.length > 72) {
    throw new Error(
      'La contraseña debe tener entre 12 y 72 caracteres'
    );
  }

  // Verificar si ya existe
  const existente = await repository.buscarPorCorreo(correo);

  if (existente) {
    throw new Error('El correo ya está registrado');
  }

  // Buscar el rol de Empleado
  const idRol = await repository.obtenerRolEmpleado();

  if (!idRol) {
    throw new Error('No existe el rol Empleado');
  }

  // Generar hash seguro de la contraseña
  const hash = await bcrypt.hash(clave, 12);

  // Guardar en MySQL
  return repository.registrarUsuario(
    nombre,
    correo,
    hash,
    idRol
  );
}
