
export const ROLES = {
  ADMIN: 'Administrador General',
  ENCARGADO: 'Encargado de Farmacia',
  EMPLEADO: 'Empleado'
} as const;

// Nombre anterior utilizado en tu base de datos.
export const ADMIN_ANTERIOR = 'Administrador';

export const ACCESO_MODULOS: Record<string, string[]> = {
  '/inicio': [
    ROLES.ADMIN,
    ADMIN_ANTERIOR,
    ROLES.ENCARGADO,
    ROLES.EMPLEADO
  ],

  '/inventario': [
    ROLES.ADMIN,
    ADMIN_ANTERIOR,
    ROLES.ENCARGADO,
    ROLES.EMPLEADO
  ],

  '/ventas': [
    ROLES.ADMIN,
    ADMIN_ANTERIOR,
    ROLES.ENCARGADO,
    ROLES.EMPLEADO
  ],

  '/crm': [
    ROLES.ADMIN,
    ADMIN_ANTERIOR,
    ROLES.ENCARGADO,
    ROLES.EMPLEADO
  ],

  '/proveedores': [
    ROLES.ADMIN,
    ADMIN_ANTERIOR,
    ROLES.ENCARGADO
  ],

  // Reportes de ventas (pantalla dentro del módulo de ventas): el Empleado no entra.
  '/reportes': [
    ROLES.ADMIN,
    ADMIN_ANTERIOR,
    ROLES.ENCARGADO
  ],

  '/contabilidad': [
    ROLES.ADMIN,
    ADMIN_ANTERIOR
  ],

  '/rrhh': [
    ROLES.ADMIN,
    ADMIN_ANTERIOR
  ],

  '/dashboard': [
    ROLES.ADMIN,
    ADMIN_ANTERIOR
  ],

  '/usuarios': [
    ROLES.ADMIN,
    ADMIN_ANTERIOR
  ]
};

export function puedeAcceder(
  rol: string | undefined | null,
  ruta: string
): boolean {
  if (!rol) {
    return false;
  }

  return ACCESO_MODULOS[ruta]?.includes(rol) ?? false;
}
