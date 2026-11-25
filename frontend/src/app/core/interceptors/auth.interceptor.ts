
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.obtenerToken();

  // Solo agregar el JWT a las solicitudes de HealKit.
  const esApiHealKit = req.url.startsWith(
    'http://localhost:3000/api/'
  );

  // El inicio de sesión no necesita token.
  const esLogin = req.url.endsWith('/auth/login');

  if (!token || !esApiHealKit || esLogin) {
    return next(req);
  }

  // Enviar el token automáticamente.
  const solicitudAutenticada = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(solicitudAutenticada);
};
