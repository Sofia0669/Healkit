import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HkIconComponent } from '../../../shared/icons/hk-icon.component';
import { VentasApiService, ProductoVenta, ClienteVenta } from '../../../core/services/ventas.api.service';

interface LineaCarrito {
  idProducto: number;
  codigo: string;
  nombre: string;
  precio: number;
  stock: number;
  cantidad: number;
}

@Component({
  selector: 'app-nueva-venta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HkIconComponent],
  templateUrl: './nueva-venta.component.html',
  styleUrl: './nueva-venta.component.css'
})
export class NuevaVentaComponent implements OnInit {
  private api = inject(VentasApiService);
  private router = inject(Router);

  hoy = new Date();
  busqueda = '';
  resultados: ProductoVenta[] = [];
  carrito: LineaCarrito[] = [];
  clientes: ClienteVenta[] = [];
  idCliente: number | null = null;
  metodoPago = 'EFECTIVO';
  error = '';
  guardando = false;

  ngOnInit(): void {
    this.api.listarClientes().subscribe(clientes => this.clientes = clientes);
    this.buscarProductos();
  }

  buscarProductos(): void {
    this.api.buscarProductos(this.busqueda).subscribe(productos => this.resultados = productos);
  }

  agregar(producto: ProductoVenta): void {
    const linea = this.carrito.find(l => l.idProducto === producto.id);
    if (linea) {
      if (linea.cantidad < linea.stock) linea.cantidad++;
    } else if (producto.stock > 0) {
      this.carrito.push({
        idProducto: producto.id, codigo: producto.codigo, nombre: producto.nombre,
        precio: Number(producto.precioVenta), stock: producto.stock, cantidad: 1
      });
    }
  }

  quitar(indice: number): void {
    this.carrito.splice(indice, 1);
  }

  get total(): number {
    return this.carrito.reduce((suma, l) => suma + l.precio * l.cantidad, 0);
  }

  registrar(): void {
    if (this.carrito.length === 0) { this.error = 'Agrega al menos un producto.'; return; }
    if (this.carrito.some(l => !Number.isInteger(l.cantidad) || l.cantidad < 1)) {
      this.error = 'Las cantidades deben ser números enteros mayores a 0.'; return;
    }
    this.error = '';
    this.guardando = true;
    this.api.crear({
      idCliente: this.idCliente,
      metodoPago: this.metodoPago,
      items: this.carrito.map(l => ({ idProducto: l.idProducto, cantidad: l.cantidad }))
    }).subscribe({
      next: (venta) => this.router.navigate(['/ventas', venta.id, 'factura']),
      error: (e) => {
        this.guardando = false;
        this.error = e.error?.error ?? 'No se pudo registrar la venta.';
        this.buscarProductos();
      }
    });
  }

  dinero(valor: number | string): string {
    return '₡' + new Intl.NumberFormat('es-CR').format(Number(valor));
  }
}
