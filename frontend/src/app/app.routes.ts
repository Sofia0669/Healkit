
import { Routes } from '@angular/router';

import { LandingComponent } from './modules/landing/landing.component';
import { LoginComponent } from './modules/login/login.component';
import { InicioComponent } from './modules/inicio/inicio.component';
import { InventarioComponent } from './modules/inventario/inventario.component';
import { VentasComponent } from './modules/ventas/ventas.component';
import { NuevaVentaComponent } from './modules/ventas/nueva-venta/nueva-venta.component';
import { FacturaComponent } from './modules/ventas/factura/factura.component';
import { ReportesVentasComponent } from './modules/ventas/reportes/reportes.component';
import { ProveedoresComponent } from './modules/proveedores/proveedores.component';
import { CrmComponent } from './modules/crm/crm.component';
import { ContabilidadComponent } from './modules/contabilidad/contabilidad.component';
import { RecursosHumanosComponent } from './modules/recursos-humanos/recursos-humanos.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { UsuariosComponent } from './modules/usuarios/usuarios.component';
import { rolGuard } from './core/guard/rol.guard';
import { LayoutComponent } from './shared/layout/layout.component';


export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: LandingComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'inicio',
        component: InicioComponent,
        canActivate: [rolGuard]
      },
      {
        path: 'inventario',
        component: InventarioComponent,
        canActivate: [rolGuard]
      },
      {
        path: 'ventas',
        canActivate: [rolGuard],
        children: [
          { path: '', component: VentasComponent },
          { path: 'nueva', component: NuevaVentaComponent },
          { path: 'reportes', component: ReportesVentasComponent, canActivate: [rolGuard] },
          { path: ':id/factura', component: FacturaComponent }
        ]
      },
      {
        path: 'proveedores',
        component: ProveedoresComponent,
        canActivate: [rolGuard]
      },
      {
        path: 'crm',
        component: CrmComponent,
        canActivate: [rolGuard]
      },
      {
        path: 'contabilidad',
        component: ContabilidadComponent,
        canActivate: [rolGuard]
      },
      {
        path: 'rrhh',
        component: RecursosHumanosComponent,
        canActivate: [rolGuard]
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [rolGuard]
      },
      {
        path: 'usuarios',
        component: UsuariosComponent,
        canActivate: [rolGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
