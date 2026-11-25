import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HkIconComponent } from '../../shared/icons/hk-icon.component';
import { AuthService } from '../../core/services/auth.service';
import { puedeAcceder, ROLES } from '../../core/config/roles';
import { InventarioApiService } from '../../core/services/inventario.api.service';
import { VentasApiService, VentaResumen } from '../../core/services/ventas.api.service';

interface Tarjeta {
  url: string;
  icono: string;
  etiqueta: string;
  valor: string;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, HkIconComponent, DatePipe],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {
  private auth = inject(AuthService);
  private inventario = inject(InventarioApiService);
  private ventas = inject(VentasApiService);

  // Fecha real de hoy.
  readonly hoy = new Date();

  // Tarjetas de resumen: solo se muestran las de los módulos a los que el rol tiene acceso.
  tarjetas: Tarjeta[] = [];

  // Primer nombre del usuario que inició sesión, por ejemplo "Erick".
  get nombre(): string {
    return (this.auth.usuarioActual?.nombre ?? '').trim().split(/\s+/)[0] || 'usuario';
  }

  ngOnInit(): void {
    const rol = this.auth.usuarioActual?.rol;
    // El Empleado ve solo sus ventas de hoy; los gerentes ven las ventas del mes.
    const esEmpleado = rol === ROLES.EMPLEADO;

    if (puedeAcceder(rol, '/inventario')) {
      const tarjeta = this.agregar('/inventario', 'pill', 'Inventario');
      this.inventario.listar().subscribe({
        next: (productos) => tarjeta.valor = String(productos.length),
        error: () => tarjeta.valor = '—'
      });
    }

    if (puedeAcceder(rol, '/ventas')) {
      const tarjeta = this.agregar('/ventas', 'cart', esEmpleado ? 'Mis ventas de hoy' : 'Ventas del mes');
      this.ventas.listar().subscribe({
        next: (lista) => tarjeta.valor = this.dinero(this.sumar(lista, esEmpleado)),
        error: () => tarjeta.valor = '—'
      });
    }

    if (puedeAcceder(rol, '/crm')) {
      const tarjeta = this.agregar('/crm', 'users', 'Clientes');
      this.ventas.listarClientes().subscribe({
        next: (clientes) => tarjeta.valor = String(clientes.length),
        error: () => tarjeta.valor = '—'
      });
    }
  }

  private agregar(url: string, icono: string, etiqueta: string): Tarjeta {
    const tarjeta: Tarjeta = { url, icono, etiqueta, valor: '…' };
    this.tarjetas.push(tarjeta);
    return tarjeta;
  }

  // Suma las ventas completadas: de hoy (Empleado) o del mes actual (gerentes).
  private sumar(lista: VentaResumen[], soloHoy: boolean): number {
    const ahora = new Date();
    return lista
      .filter((v) => {
        if (v.estado !== 'COMPLETADA') return false;
        const f = new Date(v.fecha);
        return soloHoy
          ? f.toDateString() === ahora.toDateString()
          : f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear();
      })
      .reduce((suma, v) => suma + Number(v.total), 0);
  }

  private dinero(valor: number): string {
    return '₡' + new Intl.NumberFormat('es-CR').format(valor);
  }
}
