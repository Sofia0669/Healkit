
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HkIconComponent } from '../../shared/icons/hk-icon.component';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HkIconComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  usuario = '';
  clave = '';
  mostrarClave = false;
  recordar = false;

  cargando = false;
  error = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  
entrar(): void {
  if (this.cargando) {
    return;
  }

  const correo = this.usuario.trim().toLowerCase();

  if (!correo || !this.clave) {
    this.error = 'Debes ingresar tu correo y contraseña.';
    return;
  }

  this.cargando = true;
  this.error = '';

  this.authService.iniciarSesion(
    correo,
    this.clave
  ).subscribe({
    next: () => {
      this.cargando = false;
      this.clave = '';
      this.error = '';

      this.router.navigateByUrl('/inicio');
    },
    error: (err) => {
      this.cargando = false;

      if (err.status === 400 || err.status === 401) {
        this.error = 'Correo o contraseña incorrectos.';
      } else if (err.status === 403) {
        this.error = 'Tu cuenta no tiene acceso al sistema.';
      } else if (err.status === 0) {
        this.error = 'No se pudo conectar con el servidor.';
      } else {
        this.error =
          err.error?.mensaje ||
          err.message ||
          'No se pudo iniciar sesión.';
      }
    }
  });
}
}
