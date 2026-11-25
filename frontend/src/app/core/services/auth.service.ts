
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';

export interface UsuarioSesion {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
}

interface RespuestaLogin {
  token?: string;
  tokenAcceso?: string;
  usuario?: UsuarioSesion;
  datos?: {
    token?: string;
    tokenAcceso?: string;
    usuario?: UsuarioSesion;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl =
    'http://localhost:3000/api/auth';

  private readonly TOKEN_KEY = 'healkit_token';

  private readonly USUARIO_KEY = 'healkit_usuario';

  private token: string | null = null;
  private usuario: UsuarioSesion | null = null;

  constructor(private http: HttpClient) {
    this.restaurarSesion();
  }

  // INICIAR SESION
  iniciarSesion(
    correo: string,
    clave: string
  ): Observable<UsuarioSesion> {

    return this.http.post<RespuestaLogin>(
      `${this.apiUrl}/login`,
      { correo, clave }
    ).pipe(
      map(respuesta => {

        const token =
          respuesta.token ??
          respuesta.tokenAcceso ??
          respuesta.datos?.token ??
          respuesta.datos?.tokenAcceso;

        const usuario =
          respuesta.usuario ??
          respuesta.datos?.usuario;

        if (!token || !usuario) {
          throw new Error(
            'La respuesta del login no contiene token o usuario.'
          );
        }

        return { token, usuario };
      }),

      tap(({ token, usuario }) => {

        this.token = token;
        this.usuario = usuario;

        // Guardar sesión en navegador.
        localStorage.setItem(
          this.TOKEN_KEY,
          token
        );

        localStorage.setItem(
          this.USUARIO_KEY,
          JSON.stringify(usuario)
        );
      }),

      map(({ usuario }) => usuario)
    );
  }

  // RESTAURAR SESION AL RECARGAR
  private restaurarSesion(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const usuarioGuardado =
      localStorage.getItem(this.USUARIO_KEY);

    if (!token || !usuarioGuardado) {
      this.cerrarSesion();
      return;
    }

    try {
      const usuario = JSON.parse(
        usuarioGuardado
      ) as UsuarioSesion;

      // Comprobar la fecha de expiración del JWT.
      const partes = token.split('.');

      if (partes.length !== 3) {
        this.cerrarSesion();
        return;
      }

      const base64 = partes[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const payload = JSON.parse(
        atob(base64)
      );

      const ahora = Math.floor(Date.now() / 1000);

      if (
        typeof payload.exp !== 'number' ||
        payload.exp <= ahora
      ) {
        this.cerrarSesion();
        return;
      }

      if (
        !usuario ||
        typeof usuario.id !== 'number' ||
        typeof usuario.rol !== 'string'
      ) {
        this.cerrarSesion();
        return;
      }

      this.token = token;
      this.usuario = usuario;

    } catch {
      this.cerrarSesion();
    }
  }

  // OBTENER TOKEN
  obtenerToken(): string | null {
    return this.estaAutenticado()
      ? this.token
      : null;
  }

  // USUARIO ACTUAL
  get usuarioActual(): UsuarioSesion | null {
    return this.usuario;
  }

  // COMPROBAR SESION
  estaAutenticado(): boolean {
    if (!this.token) {
      return false;
    }

    try {
      const base64 = this.token.split('.')[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const payload = JSON.parse(atob(base64));

      const ahora = Math.floor(Date.now() / 1000);

      if (
        typeof payload.exp !== 'number' ||
        payload.exp <= ahora
      ) {
        this.cerrarSesion();
        return false;
      }

      return true;

    } catch {
      this.cerrarSesion();
      return false;
    }
  }

  // VERIFICAR ADMINISTRADOR
  esAdministrador(): boolean {
    return [
      'Administrador General',
      'Administrador'
    ].includes(this.usuario?.rol ?? '');
  }

  // CERRAR SESION
  cerrarSesion(): void {
    this.token = null;
    this.usuario = null;

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USUARIO_KEY);
  }
}
