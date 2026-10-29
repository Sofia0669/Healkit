import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/inicio/inicio.component';
import { InventoryComponent } from './pages/inventario/inventario.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { VentasComponent } from './pages/ventas/ventas';
export const routes: Routes = [
  {path:'',pathMatch:'full',redirectTo:'login'},
  {path:'login',component:LoginComponent,title:'Iniciar sesión | HealKit'},
  {path:'',component:LayoutComponent,children:[
    {path:'inicio',component:HomeComponent,title:'Inicio | HealKit'},
    {path:'inventario',component:InventoryComponent,title:'Inventario | HealKit'},
    {path:'ventas',component:VentasComponent,title:'Ventas | HealKit'}
  ]},
  {path:'**',redirectTo:'login'}
];
