import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HkIconComponent } from '../../shared/icons/hk-icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HkIconComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  usuario = '';
  clave = '';
  mostrarClave = false;
  recordar = false;

  constructor(private router: Router) {}

  entrar(): void {
    // Prototipo visual: NO autentica contra el servidor.
    this.router.navigateByUrl('/inicio');
  }
}
