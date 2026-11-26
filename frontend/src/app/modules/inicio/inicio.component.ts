import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HkIconComponent } from '../../shared/icons/hk-icon.component';
import { AuthService } from '../../core/services/auth.service';
import { puedeAcceder } from '../../core/config/roles';
import { InventarioApiService, Producto } from '../../core/services/inventario.api.service';
import { VentasApiService, VentaResumen } from '../../core/services/ventas.api.service';
import { ProveedoresApiService } from '../../core/services/proveedores.api.service';

interface Kpi {
  url: string;
  icono: string;
  etiqueta: string;
  valor: string;
  detalle: string;
  alerta?: boolean;
}

interface Accion {
  url: string;
  icono: string;
  texto: string;
  principal?: boolean;
}

interface BarraDia {
  etiqueta: string;
  total: number;
  alto: number;
  hoy: boolean;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, HkIconComponent, DatePipe, TitleCasePipe],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {
  private auth = inject(AuthService);
  private inventario = inject(InventarioApiService);
  private ventas = inject(VentasApiService);
  private proveedores = inject(ProveedoresApiService);

  readonly hoy = new Date();

  esGestor = false;     // Administrador o Encargado: ven reportes, proveedores y valor del inventario
  esAdmin = false;
  kpis: Kpi[] = [];
  acciones: Accion[] = [];
  enAlerta: Producto[] = [];
  ultimas: VentaResumen[] = [];
  barras: BarraDia[] = [];
  totalSemana = 0;
  topProductos: { nombre: string; unidades: number }[] = [];
  cargandoVentas = true;
  cargandoInventario = true;

  get nombre(): string {
    return (this.auth.usuarioActual?.nombre ?? '').trim().split(/\s+/)[0] || 'usuario';
  }

  get rol(): string {
    return this.auth.usuarioActual?.rol ?? '';
  }

  // Fecha de hoy en español, por ejemplo "Jueves 26 de noviembre, 2026".
  get fechaHoy(): string {
    const texto = this.hoy.toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  get saludo(): string {
    const h = this.hoy.getHours();
    return h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches';
  }

  get descripcionRol(): string {
    if (this.esAdmin) return 'Vista general de la farmacia: ventas, inventario, compras y usuarios.';
    if (this.esGestor) return 'Resumen de la operación diaria: ventas, existencias y órdenes de compra.';
    return 'Todo lo que necesita para atender en el mostrador.';
  }

  ngOnInit(): void {
    const rol = this.auth.usuarioActual?.rol;
    this.esGestor = puedeAcceder(rol, '/reportes');
    this.esAdmin = puedeAcceder(rol, '/usuarios');

    this.armarAcciones(rol);

    // Los indicadores se agregan en orden; cada uno se llena cuando llega su dato.
    const kHoy = this.nuevoKpi('/ventas', 'cart', this.esGestor ? 'Ventas de hoy' : 'Mis ventas de hoy');
    const kMes = this.esGestor ? this.nuevoKpi('/ventas', 'coins', 'Ventas del mes') : null;
    const kAlerta = this.nuevoKpi('/inventario', 'alert', 'Productos en alerta');
    const kOrdenes = this.esGestor ? this.nuevoKpi('/proveedores', 'truck', 'Órdenes por recibir') : null;
    const kValor = this.esGestor ? this.nuevoKpi('/inventario', 'package', 'Valor del inventario') : null;
    const kClientes = !this.esGestor && puedeAcceder(rol, '/crm') ? this.nuevoKpi('/crm', 'users', 'Clientes registrados') : null;

    this.ventas.listar().subscribe({
      next: (lista) => {
        const ok = lista.filter((v) => v.estado === 'COMPLETADA');
        const deHoy = ok.filter((v) => this.mismoDia(new Date(v.fecha), this.hoy));
        kHoy.valor = this.dinero(this.sumar(deHoy));
        kHoy.detalle = this.plural(deHoy.length, 'venta', 'ventas');
        if (kMes) {
          const delMes = ok.filter((v) => {
            const f = new Date(v.fecha);
            return f.getMonth() === this.hoy.getMonth() && f.getFullYear() === this.hoy.getFullYear();
          });
          kMes.valor = this.dinero(this.sumar(delMes));
          kMes.detalle = this.plural(delMes.length, 'venta', 'ventas');
        }
        this.ultimas = [...lista]
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
          .slice(0, 6);
        this.armarSemana(ok);
        this.cargandoVentas = false;
      },
      error: () => {
        kHoy.valor = '—';
        if (kMes) kMes.valor = '—';
        this.cargandoVentas = false;
      }
    });

    this.inventario.listar().subscribe({
      next: (productos) => {
        const activos = productos.filter((p) => p.activo !== false);
        const agotados = activos.filter((p) => p.stockActual <= 0).length;
        const bajos = activos.filter((p) => p.stockActual > 0 && p.stockActual <= p.stockMinimo).length;
        kAlerta.valor = String(agotados + bajos);
        kAlerta.detalle = `${agotados} agotados · ${bajos} con stock bajo`;
        kAlerta.alerta = agotados + bajos > 0;
        this.enAlerta = activos
          .filter((p) => p.stockActual <= p.stockMinimo)
          .sort((a, b) => a.stockActual - b.stockActual)
          .slice(0, 6);
        if (kValor) {
          const valor = activos.reduce((s, p) => s + Number(p.precioCompra) * Number(p.stockActual), 0);
          kValor.valor = this.dinero(valor);
          kValor.detalle = this.plural(activos.length, 'producto', 'productos');
        }
        this.cargandoInventario = false;
      },
      error: () => {
        kAlerta.valor = '—';
        if (kValor) kValor.valor = '—';
        this.cargandoInventario = false;
      }
    });

    if (kOrdenes) {
      this.proveedores.listarCompras().subscribe({
        next: (compras) => {
          const porRecibir = compras.filter((c) => c.estado === 'SOLICITADA' || c.estado === 'PARCIAL').length;
          const borradores = compras.filter((c) => c.estado === 'BORRADOR').length;
          kOrdenes.valor = String(porRecibir);
          kOrdenes.detalle = `${this.plural(borradores, 'orden', 'órdenes')} por aprobar`;
        },
        error: () => kOrdenes.valor = '—'
      });
    }

    if (kClientes) {
      this.ventas.listarClientes().subscribe({
        next: (clientes) => {
          kClientes.valor = String(clientes.length);
          kClientes.detalle = 'en el directorio';
        },
        error: () => kClientes.valor = '—'
      });
    }

    if (this.esGestor) {
      const hasta = this.fechaIso(this.hoy);
      const desdeFecha = new Date(this.hoy);
      desdeFecha.setDate(desdeFecha.getDate() - 29);
      this.ventas.reportes(this.fechaIso(desdeFecha), hasta).subscribe({
        next: (r) => {
          this.topProductos = r.productosMasVendidos
            .slice(0, 5)
            .map((p) => ({ nombre: p.nombre, unidades: Number(p.unidades) }));
        },
        error: () => this.topProductos = []
      });
    }
  }

  private armarAcciones(rol: string | undefined): void {
    const lista: Accion[] = [
      { url: '/ventas/nueva', icono: 'plus', texto: 'Nueva venta', principal: true },
      { url: '/inventario', icono: 'package', texto: 'Inventario' },
      { url: '/ventas', icono: 'receipt', texto: 'Lista de ventas' },
      { url: '/crm', icono: 'users', texto: 'Clientes' }
    ];
    if (puedeAcceder(rol, '/proveedores')) lista.push({ url: '/proveedores', icono: 'truck', texto: 'Proveedores y compras' });
    if (puedeAcceder(rol, '/reportes')) lista.push({ url: '/ventas/reportes', icono: 'chart', texto: 'Reportes de ventas' });
    if (puedeAcceder(rol, '/dashboard')) lista.push({ url: '/dashboard', icono: 'database', texto: 'Dashboard Power BI' });
    if (puedeAcceder(rol, '/usuarios')) lista.push({ url: '/usuarios', icono: 'lock', texto: 'Gestión de usuarios' });
    this.acciones = lista;
  }

  // Ventas completadas de los últimos 7 días, un gráfico de barras sencillo.
  private armarSemana(completadas: VentaResumen[]): void {
    const dias: { fecha: Date; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(this.hoy);
      d.setDate(d.getDate() - i);
      dias.push({ fecha: d, total: 0 });
    }
    for (const v of completadas) {
      const f = new Date(v.fecha);
      const dia = dias.find((d) => this.mismoDia(d.fecha, f));
      if (dia) dia.total += Number(v.total);
    }
    const max = Math.max(...dias.map((d) => d.total), 1);
    this.totalSemana = dias.reduce((s, d) => s + d.total, 0);
    this.barras = dias.map((d) => ({
      etiqueta: d.fecha.toLocaleDateString('es-CR', { weekday: 'short' }).replace('.', ''),
      total: d.total,
      alto: d.total > 0 ? Math.max(6, Math.round((d.total / max) * 100)) : 2,
      hoy: this.mismoDia(d.fecha, this.hoy)
    }));
  }

  private nuevoKpi(url: string, icono: string, etiqueta: string): Kpi {
    const kpi: Kpi = { url, icono, etiqueta, valor: '…', detalle: '' };
    this.kpis.push(kpi);
    return kpi;
  }

  estadoProducto(p: Producto): string {
    return p.stockActual <= 0 ? 'Agotado' : 'Stock bajo';
  }

  claseEstado(estado: string): string {
    return estado === 'COMPLETADA' ? 'status-teal' : 'status-blue';
  }

  dinero(valor: number | string): string {
    return '₡' + new Intl.NumberFormat('es-CR').format(Number(valor));
  }

  private sumar(lista: VentaResumen[]): number {
    return lista.reduce((s, v) => s + Number(v.total), 0);
  }

  private mismoDia(a: Date, b: Date): boolean {
    return a.toDateString() === b.toDateString();
  }

  private plural(n: number, uno: string, varios: string): string {
    return `${n} ${n === 1 ? uno : varios}`;
  }

  private fechaIso(d: Date): string {
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  }
}
