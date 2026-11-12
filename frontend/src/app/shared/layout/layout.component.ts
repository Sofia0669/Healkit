import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HkIconComponent } from '../icons/hk-icon.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, HkIconComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  menuAbierto = false;

  readonly menu = [
    {url:'/inicio',label:'Inicio',icon:'home'},
    {url:'/inventario',label:'Inventario',icon:'package'},
    {url:'/ventas',label:'Ventas',icon:'cart'},
    {url:'/proveedores',label:'Proveedores',icon:'truck'},
    {url:'/crm',label:'CRM',icon:'users'},
    {url:'/contabilidad',label:'Contabilidad',icon:'database'},
    {url:'/rrhh',label:'Recursos Humanos',icon:'briefcase'},
    {url:'/dashboard',label:'Dashboard Power BI',icon:'chart'}
  ];
}
