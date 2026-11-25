
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


export async function obtenerPorId(id) {
  const idUsuario = validarId(id);

  const usuario = await repository.buscarPorId(idUsuario);

  if (!usuario) {
    throw crearError('Usuario no encontrado', 404);
  }

  return usuario;
}


export async function actualizar(id, datos, adminActual) {
  const idUsuario = validarId(id);

  if (!datos || typeof datos !== 'object' ||
      Array.isArray(datos)) {
    throw crearError('Datos inválidos');
  }

  const { nombre, correo, idRol } = datos;

  if (typeof nombre !== 'string' ||
      typeof correo !== 'string') {
    throw crearError('Nombre y correo son obligatorios');
  }

  const nombreLimpio = nombre.trim();
  const correoLimpio = correo.trim().toLowerCase();

  if (!nombreLimpio || nombreLimpio.length > 150) {
    throw crearError('Nombre inválido');
  }

  if (
    correoLimpio.length > 150 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)
  ) {
    throw crearError('Correo inválido');
  }

  const usuarioActual = await repository.buscarPorId(idUsuario);

  if (!usuarioActual) {
    throw crearError('Usuario no encontrado', 404);
  }

  // Validar que el rol exista.
  const rol = await validarRol(idRol);

  // El administrador no puede quitarse su propio rol.
  if (
    idUsuario === Number(adminActual.id) &&
    rol.nombre !== usuarioActual.rol
  ) {
    throw crearError('No puedes cambiar tu propio rol');
  }

  // Comprobar que el correo no lo utiliza otro usuario.
  const correoExistente =
    await repository.buscarPorCorreo(correoLimpio);

  if (
    correoExistente &&
    Number(correoExistente.id_usuario) !== idUsuario
  ) {
    throw crearError('El correo ya está registrado', 409);
  }

  return repository.actualizar(idUsuario, {
    nombre: nombreLimpio,
    correo: correoLimpio,
    idRol: rol.id_rol
  });
}


export async function contarAdministradoresActivos() {
  const [filas] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM usuarios u
     INNER JOIN roles r ON u.id_rol = r.id_rol
     WHERE u.activo = 1
       AND r.nombre IN (
         'Administrador',
         'Administrador General'
       )`
  );

  return Number(filas[0].total);
}


export async function eliminar(id, adminActual) {
  const idUsuario = validarId(id);

  if (idUsuario === Number(adminActual.id)) {
    throw crearError(
      'No puedes eliminar tu propia cuenta'
    );
  }

  const usuario = await repository.buscarPorId(idUsuario);

  if (!usuario) {
    throw crearError('Usuario no encontrado', 404);
  }

  if (!usuario.activo) {
    throw crearError('El usuario ya está desactivado', 409);
  }

  const esAdministrador = [
    'Administrador',
    'Administrador General'
  ].includes(usuario.rol);

  if (esAdministrador) {
    const total =
      await repository.contarAdministradoresActivos();

    if (total <= 1) {
      throw crearError(
        'No puedes eliminar al último administrador activo'
      );
    }
  }

  await repository.eliminar(idUsuario);

  return {
    mensaje: 'Usuario desactivado correctamente'
  };
}
