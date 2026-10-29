import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HkIconComponent } from '../../shared/hk-icon/hk-icon.component';

export type EstadoOrden = 'Pendiente' | 'En tránsito' | 'Recibida';
export interface OrdenCompra {
  codigo: string;
  proveedor: string;
  fecha: string;
  entrega: string;
  total: number;
  estado: EstadoOrden;
}

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [FormsModule, HkIconComponent],
  templateUrl: './proveedores.html',
  styleUrl: './proveedores.css'
})
export class ProveedoresComponent {
  busqueda = '';
  filtro: 'Todos' | EstadoOrden = 'Todos';
  mostrarFiltros = false;
  modal = false;
  editando: string | null = null;

  ordenes = signal<OrdenCompra[]>([
    { codigo: 'OC-0018', proveedor: 'Distribuidora Médica CR', fecha: '2026-10-24', entrega: '2026-10-29', total: 185000, estado: 'Pendiente' },
    { codigo: 'OC-0017', proveedor: 'Farmacéutica del Caribe', fecha: '2026-10-22', entrega: '2026-10-27', total: 320500, estado: 'En tránsito' },
    { codigo: 'OC-0016', proveedor: 'Suministros Saludables', fecha: '2026-10-20', entrega: '2026-10-24', total: 95800, estado: 'Recibida' },
    { codigo: 'OC-0015', proveedor: 'MedImport Costa Rica', fecha: '2026-10-18', entrega: '2026-10-21', total: 410000, estado: 'Recibida' }
  ]);

  draft: OrdenCompra = this.vacia();

  visibles = computed(() => this.ordenes());

  get ordenesFiltradas(): OrdenCompra[] {
    const texto = this.busqueda.trim().toLocaleLowerCase('es');
    return this.ordenes().filter(o =>
      (o.codigo + ' ' + o.proveedor + ' ' + o.estado).toLocaleLowerCase('es').includes(texto) &&
      (this.filtro === 'Todos' || o.estado === this.filtro)
    );
  }

  vacia(): OrdenCompra {
    return { codigo: '', proveedor: '', fecha: '2026-10-28', entrega: '2026-11-02', total: 0, estado: 'Pendiente' };
  }

  fechaBonita(fecha: string): string {
    const [a, m, d] = fecha.split('-');
    return `${d}/${m}/${a}`;
  }

  dinero(monto: number): string {
    return '€ ' + monto.toLocaleString('es-ES', { maximumFractionDigits: 0 });
  }

  nuevaOrden(): void {
    this.editando = null;
    this.draft = this.vacia();
    this.modal = true;
  }

  editarOrden(orden: OrdenCompra): void {
    this.editando = orden.codigo;
    this.draft = { ...orden };
    this.modal = true;
  }

  verOrden(orden: OrdenCompra): void {
    alert(`Orden: ${orden.codigo}\nProveedor: ${orden.proveedor}\nFecha: ${this.fechaBonita(orden.fecha)}\nEntrega: ${this.fechaBonita(orden.entrega)}\nTotal: ${this.dinero(orden.total)}\nEstado: ${orden.estado}`);
  }

  guardarOrden(): void {
    const o = { ...this.draft, codigo: this.draft.codigo.trim(), proveedor: this.draft.proveedor.trim() };
    if (!o.codigo || !o.proveedor || !o.fecha || !o.entrega || !Number.isFinite(o.total) || o.total < 0) {
      alert('Completa los campos y escribe un monto válido.');
      return;
    }
    if (this.ordenes().some(x => x.codigo === o.codigo && x.codigo !== this.editando)) {
      alert('El número de orden ya existe.');
      return;
    }
    if (this.editando) {
      this.ordenes.update(lista => lista.map(x => x.codigo === this.editando ? o : x));
    } else {
      this.ordenes.update(lista => [o, ...lista]);
    }
    this.modal = false;
  }

  verProveedores(): void {
    alert('Proveedor destacado: Distribuidora Médica CR.\nEste apartado se conectará con MySQL posteriormente.');
  }

  verReportes(): void {
    alert('Los reportes de precios y entregas estarán disponibles al conectar el backend.');
  }
}
