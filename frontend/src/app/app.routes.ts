import { Routes } from '@angular/router';
import { LoginComponent } from './modules/login/login.component';
import { InicioComponent } from './modules/inicio/inicio.component';
import { InventarioComponent } from './modules/inventario/inventario.component';
import { VentasComponent } from './modules/ventas/ventas.component';
import { ProveedoresComponent } from './modules/proveedores/proveedores.component';
import { CrmComponent } from './modules/crm/crm.component';
import { ContabilidadComponent } from './modules/contabilidad/contabilidad.component';
import { RecursosHumanosComponent } from './modules/recursos-humanos/recursos-humanos.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { LayoutComponent } from './shared/layout/layout.component';

export const routes: Routes = [
  {path:'',pathMatch:'full',redirectTo:'login'},
  {path:'login',component:LoginComponent},
  {path:'',component:LayoutComponent,children:[
    {path:'inicio',component:InicioComponent},
    {path:'inventario',component:InventarioComponent},
    {path:'ventas',component:VentasComponent},
    {path:'proveedores',component:ProveedoresComponent},
    {path:'crm',component:CrmComponent},
    {path:'contabilidad',component:ContabilidadComponent},
    {path:'rrhh',component:RecursosHumanosComponent},
    {path:'dashboard',component:DashboardComponent}
  ]},
  {path:'**',redirectTo:'login'}
];
