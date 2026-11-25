
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModuleViewComponent } from
  '../../shared/components/module-view/module-view.component';

import { ModuleConfig } from
  '../../shared/models/module-config';

import { INVENTARIO_CONFIG } from './inventario.config';

import {
  InventarioApiService,
  Producto
} from '../../core/services/inventario.api.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, ModuleViewComponent],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent implements OnInit {

  private readonly inventarioApi = inject(InventarioApiService);

  config: ModuleConfig = {
    ...INVENTARIO_CONFIG,
    stats: INVENTARIO_CONFIG.stats.map(s => ({ ...s })),
    rows: []
  };

  cargando = false;
  error = '';
  productos: Producto[] = [];

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.error = '';

    this.inventarioApi.listar().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.actualizarVista(productos);
        this.cargando = false;
      },
      error: (err) => {
        this.error =
          err.error?.mensaje ??
          err.message ??
          'No se pudieron cargar los productos.';

        this.cargando = false;
      }
    });
  }

  private actualizarVista(productos: Producto[]): void {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const limite = new Date(hoy);
    limite.setDate(limite.getDate() + 30);

    const activos = productos.filter(p => p.activo);

    const stockBajo = activos.filter(
      p => p.stockActual <= p.stockMinimo
    ).length;

    const conFecha = activos.filter(p =>
      p.vencimiento && this.obtenerFecha(p.vencimiento)
    );

    const proximos = conFecha.filter(p => {
      const fecha = this.obtenerFecha(p.vencimiento!);
      return fecha !== null && fecha >= hoy && fecha <= limite;
    }).length;

    const vencidos = conFecha.filter(p => {
      const fecha = this.obtenerFecha(p.vencimiento!);
      return fecha !== null && fecha < hoy;
    }).length;

    this.config = {
      ...this.config,

      stats: [
        {
          icon: 'package',
          label: 'Productos totales',
          value: String(activos.length)
        },
        {
          icon: 'alert',
          label: 'Stock bajo',
          value: String(stockBajo)
        },
        {
          icon: 'calendar',
          label: 'Próximos a vencer',
          value: activos.every(p => p.vencimiento) ?
            String(proximos) : '—'
        },
        {
          icon: 'ban',
          label: 'Vencidos',
          value: activos.every(p => p.vencimiento) ?
            String(vencidos) : '—'
        }
      ],

      rows: activos.map(p => [
        p.codigo,
        p.nombre,
        p.categoria,
        p.presentacion,
        String(p.stockActual),
        this.formatearFecha(p.vencimiento),
        this.obtenerEstado(p, hoy)
      ])
    };
  }

  private obtenerFecha(valor: string): Date | null {
    const fecha = new Date(valor);

    if (Number.isNaN(fecha.getTime())) {
      return null;
    }

    fecha.setHours(0, 0, 0, 0);
    return fecha;
  }

  private formatearFecha(valor: string | null): string {
    if (!valor) {
      return '—';
    }

    const fecha = this.obtenerFecha(valor);

    if (!fecha) {
      return '—';
    }

    return fecha.toLocaleDateString('es-CR');
  }

  private obtenerEstado(producto: Producto, hoy: Date): string {
    const fecha = producto.vencimiento
      ? this.obtenerFecha(producto.vencimiento)
      : null;

    if (fecha && fecha < hoy) {
      return 'Vencido';
    }

    if (producto.stockActual <= producto.stockMinimo) {
      return 'Stock bajo';
    }

    return 'Disponible';
  }
}
