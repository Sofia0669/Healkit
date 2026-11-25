
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  idRol: number;
  rol: string;
  activo: boolean;
  creadoEn: string;
}

export interface Rol {
  id_rol: number;
  nombre: string;
  descripcion: string;
}

export interface DatosUsuario {
  nombre: string;
  correo: string;
  idRol: number;
}

export interface NuevoUsuario extends DatosUsuario {
  clave: string;
}

export interface RespuestaUsuario {
  mensaje: string;
  usuario: Usuario;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosApiService {

  private readonly apiUrl =
    'http://localhost:3000/api/usuarios';

  constructor(private http: HttpClient) {}

  // READ: listar todos los usuarios.
  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  // READ: consultar un usuario por ID.
  obtenerPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(
      `${this.apiUrl}/${id}`
    );
  }

  // Consultar los roles.
  listarRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(
      `${this.apiUrl}/roles`
    );
  }

  // CREATE: registrar usuario.
  crear(datos: NuevoUsuario): Observable<RespuestaUsuario> {
    return this.http.post<RespuestaUsuario>(
      this.apiUrl,
      datos
    );
  }

  // UPDATE: actualizar nombre, correo y rol.
  actualizar(
    id: number,
    datos: DatosUsuario
  ): Observable<RespuestaUsuario> {
    return this.http.put<RespuestaUsuario>(
      `${this.apiUrl}/${id}`,
      datos
    );
  }

  // DELETE: eliminación lógica.
  eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(
      `${this.apiUrl}/${id}`
    );
  }

  // Activar o desactivar usuario.
  cambiarEstado(
    id: number,
    activo: boolean
  ): Observable<RespuestaUsuario> {
    return this.http.patch<RespuestaUsuario>(
      `${this.apiUrl}/${id}/estado`,
      { activo }
    );
  }
}
