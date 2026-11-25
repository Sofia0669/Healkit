
import { pool } from '../../config/db.js';
import { Usuario } from './usuarios.model.js';

// Consulta que relaciona usuarios con sus roles.
const consultaUsuarios = `
  SELECT
    u.id_usuario,
    u.id_rol,
    u.nombre,
    u.correo,
    u.activo,
    u.creado_en,
    r.nombre AS rol
  FROM usuarios u
  INNER JOIN roles r ON u.id_rol = r.id_rol
`;

// Listar todos los usuarios.
export async function listar() {
  const [filas] = await pool.query(
    consultaUsuarios + ' ORDER BY u.id_usuario DESC'
  );

  return filas.map(fila => new Usuario(fila));
}

// Buscar un usuario por ID.
export async function buscarPorId(id) {
  const [filas] = await pool.execute(
    consultaUsuarios + ' WHERE u.id_usuario = ?',
    [id]
  );

  return filas.length ? new Usuario(filas[0]) : null;
}

// Buscar si un correo ya está registrado.
export async function buscarPorCorreo(correo) {
  const [filas] = await pool.execute(
    'SELECT id_usuario FROM usuarios WHERE correo = ?',
    [correo]
  );

  return filas[0] || null;
}

// Consultar los roles disponibles.
export async function listarRoles() {
  const [filas] = await pool.query(
    `SELECT id_rol, nombre, descripcion
     FROM roles
     ORDER BY id_rol`
  );

  return filas;
}

// Verificar que un rol existe.
export async function buscarRol(idRol) {
  const [filas] = await pool.execute(
    'SELECT id_rol, nombre FROM roles WHERE id_rol = ?',
    [idRol]
  );

  return filas[0] || null;
}

// Crear un usuario nuevo.
export async function crear(datos, hash) {
  const [resultado] = await pool.execute(
    `INSERT INTO usuarios
      (id_rol, nombre, correo, password_hash, activo)
     VALUES (?, ?, ?, ?, 1)`,
    [
      datos.idRol,
      datos.nombre,
      datos.correo,
      hash
    ]
  );

  return buscarPorId(resultado.insertId);
}

// Cambiar el rol de un usuario.
export async function cambiarRol(id, idRol) {
  const [resultado] = await pool.execute(
    `UPDATE usuarios
     SET id_rol = ?
     WHERE id_usuario = ?`,
    [idRol, id]
  );

  return resultado.affectedRows
    ? buscarPorId(id)
    : null;
}

// Activar o desactivar un usuario.
export async function cambiarEstado(id, activo) {
  const [resultado] = await pool.execute(
    `UPDATE usuarios
     SET activo = ?
     WHERE id_usuario = ?`,
    [activo ? 1 : 0, id]
  );

  return resultado.affectedRows
    ? buscarPorId(id)
    : null;
}

// Actualizar datos de un usuario.
export async function actualizar(id, datos) {
  const [resultado] = await pool.execute(
    `UPDATE usuarios
     SET nombre = ?,
         correo = ?,
         id_rol = ?
     WHERE id_usuario = ?`,
    [
      datos.nombre,
      datos.correo,
      datos.idRol,
      id
    ]
  );

  if (resultado.affectedRows === 0) {
    return null;
  }

  return buscarPorId(id);
}

// Eliminar lógicamente un usuario.
export async function eliminar(id) {
  const [resultado] = await pool.execute(
    `UPDATE usuarios
     SET activo = 0
     WHERE id_usuario = ?`,
    [id]
  );

  return resultado.affectedRows > 0;
}
