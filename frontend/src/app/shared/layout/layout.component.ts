
import { Component, inject } from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { HkIconComponent } from '../icons/hk-icon.component';

import { AuthService } from '../../core/services/auth.service';
import { puedeAcceder } from '../../core/config/roles';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    HkIconComponent
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  menuAbierto = false;

  // Menú completo de HealKit.
  private readonly menuCompleto = [
    {url:'/inicio',label:'Inicio',icon:'home'},
    {url:'/inventario',label:'Inventario',icon:'package'},
    {url:'/ventas',label:'Ventas',icon:'cart'},
    {url:'/proveedores',label:'Proveedores',icon:'truck'},
    {url:'/crm',label:'CRM',icon:'users'},
    {url:'/contabilidad',label:'Contabilidad',icon:'database'},
    {url:'/rrhh',label:'Recursos Humanos',icon:'briefcase'},
    {url:'/dashboard',label:'Dashboard Power BI',icon:'chart'},
    {url:'/usuarios',label:'Gestión de Usuarios',icon:'users'}
  ];

  // Mostrar únicamente los módulos autorizados.
  get menu() {
    const rol = this.auth.usuarioActual?.rol;

    return this.menuCompleto.filter(item =>
      puedeAcceder(rol, item.url)
    );
  }

  // Cerrar la sesión actual.
 cerrarSesion(): void {
  this.auth.cerrarSesion();
  this.menuAbierto = false;
  this.router.navigateByUrl('/login');
}
}
