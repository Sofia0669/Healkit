import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HkIconComponent } from '../../shared/icons/hk-icon.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, HkIconComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  private auth = inject(AuthService);

  readonly anio = new Date().getFullYear();

  // Si ya hay sesión, el botón principal lleva directo al sistema.
  get haySesion(): boolean {
    return this.auth.estaAutenticado();
  }

  readonly modulos = [
    { icono: 'package', titulo: 'Inventario', texto: 'Catálogo de productos con stock mínimo, alertas de existencias bajas y valor total del inventario.' },
    { icono: 'cart', titulo: 'Ventas y facturación', texto: 'Registro de ventas en el mostrador, factura en pantalla y en PDF, y anulación con devolución de stock.' },
    { icono: 'truck', titulo: 'Proveedores y compras', texto: 'Órdenes de compra con aprobación, recepción de mercadería por lote y vencimiento, e historial de precios.' },
    { icono: 'chart', titulo: 'Reportes de ventas', texto: 'Ingresos por día, productos más vendidos, ventas por método de pago y por vendedor.' },
    { icono: 'database', titulo: 'Cubo OLAP en Power BI', texto: 'Tablero gerencial con las ventas por fecha, producto, cliente y vendedor.' },
    { icono: 'lock', titulo: 'Usuarios y roles', texto: 'Cada persona entra con su cuenta y ve solo lo que su rol permite, también en el servidor.' }
  ];

  readonly roles = [
    {
      icono: 'award',
      nombre: 'Administrador General',
      resumen: 'Controla todo el sistema.',
      puntos: ['Todos los módulos', 'Gestión de usuarios y roles', 'Reportes y dashboard de Power BI']
    },
    {
      icono: 'store',
      nombre: 'Encargado de Farmacia',
      resumen: 'Lleva la operación diaria.',
      puntos: ['Crea y edita productos', 'Ventas y reportes', 'Proveedores y órdenes de compra']
    },
    {
      icono: 'user',
      nombre: 'Empleado',
      resumen: 'Atiende en el mostrador.',
      puntos: ['Consulta el inventario', 'Registra ventas y emite facturas', 'Consulta clientes']
    }
  ];

  // Desplazamiento suave a una sección de la misma página.
  ir(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
