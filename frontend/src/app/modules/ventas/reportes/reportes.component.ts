import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { HkIconComponent } from '../../../shared/icons/hk-icon.component';
import { VentasApiService, ReportesVentas } from '../../../core/services/ventas.api.service';

@Component({
  selector: 'app-reportes-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HkIconComponent],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesVentasComponent implements OnInit {
  private api = inject(VentasApiService);

  desde = '';
  hasta = '';
  reportes: ReportesVentas | null = null;
  cargando = false;
  error = '';

  ngOnInit(): void { this.consultar(); }

  consultar(): void {
    this.cargando = true;
    this.error = '';
    this.api.reportes(this.desde, this.hasta).subscribe({
      next: (datos) => {
        this.reportes = datos;
        this.desde = datos.desde;
        this.hasta = datos.hasta;
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        this.error = err.error?.error ?? err.error?.mensaje ?? 'No se pudieron cargar los reportes. Verifica que el backend esté corriendo.';
      }
    });
  }

  dinero(valor: number | string): string {
    return '₡' + new Intl.NumberFormat('es-CR').format(Number(valor));
  }
}
