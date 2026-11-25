
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import {
  UsuariosApiService,
  Usuario,
  Rol,
  RespuestaUsuario
} from '../../core/services/usuarios.api.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {

  usuarios: Usuario[] = [];
  roles: Rol[] = [];

  busqueda = '';
  cargando = false;
  guardando = false;
  procesandoId: number | null = null;

  mensaje = '';
  error = '';

  mostrarFormulario = false;
  mostrarDetalle = false;

  usuarioEditando: Usuario | null = null;
  usuarioDetalle: Usuario | null = null;

  formulario = this.fb.nonNullable.group({
    nombre: ['', [
      Validators.required,
      Validators.maxLength(150)
    ]],
    correo: ['', [
      Validators.required,
      Validators.email,
      Validators.maxLength(150)
    ]],
    clave: [''],
    idRol: [0, [
      Validators.required,
      Validators.min(1)
    ]]
  });

  constructor(
    private fb: FormBuilder,
    private usuariosApi: UsuariosApiService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRoles();
  }

  // ==========================
  // CONSULTAS
  // ==========================

  cargarUsuarios(): void {
    this.cargando = true;
    this.error = '';

    this.usuariosApi.listar().subscribe({
      next: (datos) => {
        this.usuarios = datos;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        this.error = this.obtenerError(err);
      }
    });
  }

  cargarRoles(): void {
    this.usuariosApi.listarRoles().subscribe({
      next: (datos) => {
        this.roles = datos.filter(rol =>
          [
            'Administrador General',
            'Encargado de Farmacia',
            'Empleado'
          ].includes(rol.nombre)
        );
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.obtenerError(err);
      }
    });
  }

  verUsuario(usuario: Usuario): void {
    this.error = '';

    this.usuariosApi.obtenerPorId(usuario.id).subscribe({
      next: (datos) => {
        this.usuarioDetalle = datos;
        this.mostrarDetalle = true;
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.obtenerError(err);
      }
    });
  }

  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.usuarioDetalle = null;
  }

  // ==========================
  // BUSQUEDA Y ESTADISTICAS
  // ==========================

  get usuariosFiltrados(): Usuario[] {
    const texto = this.busqueda.trim().toLowerCase();

    if (!texto) {
      return this.usuarios;
    }

    return this.usuarios.filter(usuario =>
      usuario.nombre.toLowerCase().includes(texto) ||
      usuario.correo.toLowerCase().includes(texto) ||
      usuario.rol.toLowerCase().includes(texto)
    );
  }

  get totalUsuarios(): number {
    return this.usuarios.length;
  }

  get totalActivos(): number {
    return this.usuarios.filter(
      usuario => usuario.activo
    ).length;
  }

  get totalInactivos(): number {
    return this.usuarios.filter(
      usuario => !usuario.activo
    ).length;
  }

  // ==========================
  // CREATE
  // ==========================

  nuevoUsuario(): void {
    this.usuarioEditando = null;

    this.formulario.reset({
      nombre: '',
      correo: '',
      clave: '',
      idRol: 0
    });

    this.error = '';
    this.mensaje = '';
    this.mostrarFormulario = true;
  }

  // ==========================
  // UPDATE
  // ==========================

  editarUsuario(usuario: Usuario): void {
    this.usuarioEditando = usuario;

    this.formulario.reset({
      nombre: usuario.nombre,
      correo: usuario.correo,
      clave: '',
      idRol: usuario.idRol
    });

    this.error = '';
    this.mensaje = '';
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    if (this.guardando) {
      return;
    }

    this.mostrarFormulario = false;
    this.usuarioEditando = null;
  }

  // Crear o actualizar según el formulario.
  guardarUsuario(): void {
    if (this.guardando) {
      return;
    }

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const datos = this.formulario.getRawValue();

    if (!this.usuarioEditando &&
        (datos.clave.length < 12 ||
         datos.clave.length > 72)) {
      this.error =
        'La contraseña debe tener entre 12 y 72 caracteres.';
      return;
    }

    this.error = '';
    this.mensaje = '';
    this.guardando = true;

    const datosBasicos = {
      nombre: datos.nombre.trim(),
      correo: datos.correo.trim().toLowerCase(),
      idRol: datos.idRol
    };

    const solicitud = this.usuarioEditando
      ? this.usuariosApi.actualizar(
          this.usuarioEditando.id,
          datosBasicos
        )
      : this.usuariosApi.crear({
          ...datosBasicos,
          clave: datos.clave
        });

    solicitud.subscribe({
      next: (respuesta: RespuestaUsuario) => {
        this.guardando = false;
        this.cerrarFormulario();
        this.mensaje = respuesta.mensaje;
        this.cargarUsuarios();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.error = this.obtenerError(err);
      }
    });
  }

  // ==========================
  // CAMBIAR ESTADO
  // ==========================

  cambiarEstadoUsuario(usuario: Usuario): void {
    if (this.procesandoId !== null) {
      return;
    }

    const nuevoEstado = !usuario.activo;
    const accion = nuevoEstado
      ? 'activar'
      : 'desactivar';

    const confirmado = window.confirm(
      `¿Deseas ${accion} a ${usuario.nombre}?`
    );

    if (!confirmado) {
      return;
    }

    this.error = '';
    this.mensaje = '';
    this.procesandoId = usuario.id;

    this.usuariosApi.cambiarEstado(
      usuario.id,
      nuevoEstado
    ).subscribe({
      next: (respuesta) => {
        this.procesandoId = null;
        this.mensaje = respuesta.mensaje;
        this.cargarUsuarios();
      },
      error: (err: HttpErrorResponse) => {
        this.procesandoId = null;
        this.error = this.obtenerError(err);
      }
    });
  }

  // ==========================
  // DELETE - ELIMINACION LOGICA
  // ==========================

  eliminarUsuario(usuario: Usuario): void {
    if (!usuario.activo || this.procesandoId !== null) {
      return;
    }

    const confirmado = window.confirm(
      `¿Eliminar a ${usuario.nombre}?\n\n` +
      'Su cuenta quedará desactivada y se conservará ' +
      'su historial.'
    );

    if (!confirmado) {
      return;
    }

    this.error = '';
    this.mensaje = '';
    this.procesandoId = usuario.id;

    this.usuariosApi.eliminar(usuario.id).subscribe({
      next: (respuesta) => {
        this.procesandoId = null;
        this.mensaje = respuesta.mensaje;
        this.cargarUsuarios();
      },
      error: (err: HttpErrorResponse) => {
        this.procesandoId = null;
        this.error = this.obtenerError(err);
      }
    });
  }

  // ==========================
  // MANEJO DE ERRORES
  // ==========================

  private obtenerError(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'No se pudo conectar con el backend de HealKit.';
    }

    if (err.status === 401) {
      return 'La sesión no es válida. Inicia sesión nuevamente.';
    }

    if (err.status === 403) {
      return 'No tienes autorización para esta operación.';
    }

    if (err.status === 404) {
      return 'No se encontró el recurso solicitado.';
    }

    if (err.status === 409) {
      return err.error?.mensaje ||
        'Hay un conflicto con los datos del usuario.';
    }

    return err.error?.mensaje ||
      'Ocurrió un error al realizar la operación.';
  }
}
