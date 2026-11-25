import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HkIconComponent } from '../../shared/icons/hk-icon.component';
import { VentasApiService, VentaResumen } from '../../core/services/ventas.api.service';
import { VENTAS_CONFIG } from './ventas.config';
import { AuthService } from '../../core/services/auth.service';
import { puedeAcceder } from '../../core/config/roles';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HkIconComponent],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css'
})
export class VentasComponent implements OnInit {
  private api = inject(VentasApiService);
  private auth = inject(AuthService);
  readonly config = VENTAS_CONFIG;

  ventas: VentaResumen[] = [];
  query = '';
  aviso = '';

  get puedeVerReportes(): boolean { return puedeAcceder(this.auth.usuarioActual?.rol, '/reportes'); }

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.api.listar().subscribe({
      next: (ventas) => this.ventas = ventas,
      error: () => this.aviso = 'No se pudieron cargar las ventas. Verifica que el backend esté corriendo.'
    });
  }

  private get completadas(): VentaResumen[] {
    return this.ventas.filter(v => v.estado === 'COMPLETADA');
  }

  get totalDelDia(): number {
    const hoy = new Date().toDateString();
    return this.sumar(this.completadas.filter(v => new Date(v.fecha).toDateString() === hoy));
  }

  get totalDelMes(): number {
    const hoy = new Date();
    return this.sumar(this.completadas.filter(v => {
      const f = new Date(v.fecha);
      return f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear();
    }));
  }

  get cantidadCompletadas(): number { return this.completadas.length; }

  get ventasFiltradas(): VentaResumen[] {
    const texto = this.query.trim().toLowerCase();
    return this.ventas.filter(v =>
      `${v.numeroFactura} ${v.cliente ?? ''} ${v.metodoPago}`.toLowerCase().includes(texto)
    );
  }

  private sumar(ventas: VentaResumen[]): number {
    return ventas.reduce((suma, v) => suma + Number(v.total), 0);
  }

  dinero(valor: number | string): string {
    return '₡' + new Intl.NumberFormat('es-CR').format(Number(valor));
  }

  claseEstado(estado: string): string {
    return estado === 'COMPLETADA' ? 'status-teal' : 'status-blue';
  }
}
