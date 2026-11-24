
import { pool } from '../../config/db.js';

// Buscar usuario por correo.
export async function buscarPorCorreo(correo) {
  const [filas] = await pool.execute(
    `SELECT
       u.*,
       r.nombre AS rol
     FROM usuarios u
     INNER JOIN roles r
       ON u.id_rol = r.id_rol
     WHERE u.correo = ?
     LIMIT 1`,
    [correo]
  );

  return filas[0] || null;
}

// Buscar usuario activo por ID.
export async function buscarPorId(id) {
  const [filas] = await pool.execute(
    `SELECT
       u.id_usuario,
       u.nombre,
       u.correo,
       u.id_rol,
       u.activo,
       r.nombre AS rol
     FROM usuarios u
     INNER JOIN roles r
       ON u.id_rol = r.id_rol
     WHERE u.id_usuario = ?
       AND u.activo = 1`,
    [id]
  );

  return filas[0] || null;
}

export async function obtenerRolEmpleado() {
  const [filas] = await pool.execute(
    `SELECT id_rol
     FROM roles
     WHERE nombre = ?
     LIMIT 1`,
    ['Empleado']
  );

  return filas[0]?.id_rol ?? null;
}

