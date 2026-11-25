import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HkIconComponent } from '../../../shared/icons/hk-icon.component';
import { VentasApiService, VentaDetalle } from '../../../core/services/ventas.api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ROLES, ADMIN_ANTERIOR } from '../../../core/config/roles';

@Component({
  selector: 'app-factura',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HkIconComponent],
  templateUrl: './factura.component.html',
  styleUrl: './factura.component.css'
})
export class FacturaComponent implements OnInit {
  private api = inject(VentasApiService);
  private ruta = inject(ActivatedRoute);
  private auth = inject(AuthService);

  readonly empresa = { nombre: 'HealKit Pharmacy', ubicacion: 'Siquirres, Limón, Costa Rica' };

  venta: VentaDetalle | null = null;
  error = '';
  descargandoPdf = false;
  anulando = false;
  motivoAnulacion = '';
  procesandoAnulacion = false;

  ngOnInit(): void {
    const id = Number(this.ruta.snapshot.paramMap.get('id'));
    this.api.obtener(id).subscribe({
      next: (venta) => this.venta = venta,
      error: (e) => this.error = e.status === 404 ? 'La factura no existe.' : 'No se pudo cargar la factura.'
    });
  }

  get puedeAnular(): boolean {
    const rol = this.auth.usuarioActual?.rol;
    const esGerente = rol === ROLES.ADMIN || rol === ROLES.ENCARGADO || rol === ADMIN_ANTERIOR;
    return esGerente && this.venta?.estado === 'COMPLETADA';
  }

  confirmarAnulacion(): void {
    if (!this.venta) return;
    this.procesandoAnulacion = true;
    this.error = '';
    this.api.anular(this.venta.id, this.motivoAnulacion).subscribe({
      next: (venta) => {
        this.venta = venta;
        this.anulando = false;
        this.motivoAnulacion = '';
        this.procesandoAnulacion = false;
      },
      error: (e) => {
        this.procesandoAnulacion = false;
        this.error = e.error?.error ?? e.error?.mensaje ?? 'No se pudo anular la venta.';
      }
    });
  }

  descargarPdf(): void {
    if (!this.venta) return;
    const numero = this.venta.numeroFactura;
    this.descargandoPdf = true;
    this.api.descargarPdf(this.venta.id).subscribe({
      next: (pdf) => {
        const url = URL.createObjectURL(pdf);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `${numero}.pdf`;
        enlace.click();
        URL.revokeObjectURL(url);
        this.descargandoPdf = false;
      },
      error: () => {
        this.descargandoPdf = false;
        this.error = 'No se pudo descargar el PDF.';
      }
    });
  }

  dinero(valor: number | string): string {
    return '₡' + new Intl.NumberFormat('es-CR').format(Number(valor));
  }
}
