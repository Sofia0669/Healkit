
import bcrypt from 'bcryptjs';
import * as repository from './usuarios.repository.js';

// Roles permitidos en HealKit.
const ROLES_VALIDOS = [
  'Administrador',
  'Administrador General',
  'Encargado de Farmacia',
  'Empleado'
];

// Crear errores con código HTTP.
function crearError(mensaje, estado = 400) {
  const error = new Error(mensaje);
  error.estado = estado;
  return error;
}

// Validar un ID.
function validarId(valor) {
  const id = Number(valor);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw crearError('ID inválido');
  }

  return id;
}

// Verificar el rol seleccionado.
async function validarRol(idRol) {
  const id = validarId(idRol);
  const rol = await repository.buscarRol(id);

  if (!rol || !ROLES_VALIDOS.includes(rol.nombre)) {
    throw crearError('El rol seleccionado no es válido');
  }

  return rol;
}

// Obtener todos los usuarios.
export async function listar() {
  return repository.listar();
}

// Obtener los roles disponibles.
export async function listarRoles() {
  const roles = await repository.listarRoles();

  return roles.filter(rol =>
    ROLES_VALIDOS.includes(rol.nombre)
  );
}

// Registrar un usuario.
export async function crear(datos) {
  if (!datos || typeof datos !== 'object' ||
      Array.isArray(datos)) {
    throw crearError('Datos inválidos');
  }

  const { nombre, correo, clave, idRol } = datos;

  if (
    typeof nombre !== 'string' ||
    typeof correo !== 'string' ||
    typeof clave !== 'string'
  ) {
    throw crearError('Nombre, correo y contraseña son obligatorios');
  }

  const nombreLimpio = nombre.trim();
  const correoLimpio = correo.trim().toLowerCase();

  if (!nombreLimpio || nombreLimpio.length > 150) {
    throw crearError('El nombre no es válido');
  }

  if (
    correoLimpio.length > 150 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)
  ) {
    throw crearError('El correo no es válido');
  }

  if (clave.length < 12 || clave.length > 72) {
    throw crearError(
      'La contraseña debe tener entre 12 y 72 caracteres'
    );
  }

  await validarRol(idRol);

  const existente = await repository.buscarPorCorreo(
    correoLimpio
  );

  if (existente) {
    throw crearError('El correo ya está registrado', 409);
  }

  // Convertir la contraseña en un hash.
  const hash = await bcrypt.hash(clave, 12);

  return repository.crear({
    nombre: nombreLimpio,
    correo: correoLimpio,
    idRol: Number(idRol)
  }, hash);
}

// Modificar el rol.
export async function cambiarRol(id, idRol, adminActual) {
  const idUsuario = validarId(id);
  const rol = await validarRol(idRol);

  if (idUsuario === adminActual.id) {
    throw crearError('No puedes cambiar tu propio rol');
  }

  const usuario = await repository.cambiarRol(
    idUsuario,
    rol.id_rol
  );

  if (!usuario) {
    throw crearError('Usuario no encontrado', 404);
  }

  return usuario;
}

// Activar o desactivar una cuenta.
export async function cambiarEstado(id, activo, adminActual) {
  const idUsuario = validarId(id);

  if (typeof activo !== 'boolean') {
    throw crearError('El estado debe ser true o false');
  }

  if (idUsuario === adminActual.id && !activo) {
    throw crearError('No puedes desactivar tu propia cuenta');
  }

  const usuario = await repository.cambiarEstado(
    idUsuario,
    activo
  );

  if (!usuario) {
    throw crearError('Usuario no encontrado', 404);
  }

  return usuario;
}
