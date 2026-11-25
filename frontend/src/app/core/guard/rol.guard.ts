
import { inject } from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import { AuthService } from '../services/auth.service';
import { puedeAcceder } from '../config/roles';

export const rolGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Primero verificar que exista una sesión.
  if (!auth.estaAutenticado()) {
    return router.createUrlTree(['/login']);
  }

  // Consultar el rol del usuario.
  const rol = auth.usuarioActual?.rol;

  // Obtener el módulo que intenta abrir.
  const modulo = route.routeConfig?.path;

  if (!modulo) {
    return router.createUrlTree(['/inicio']);
  }

  const ruta = `/${modulo}`;

  // Verificar si el rol tiene acceso.
  if (puedeAcceder(rol, ruta)) {
    return true;
  }

  // Si no está autorizado, regresar a Inicio.
  return router.createUrlTree(['/inicio']);
};
