import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Importante para usar los inputs

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule], // <-- Agrégalo aquí también
  templateUrl: './ventas.html',
  styleUrls: ['./ventas.css']
})
export class VentasComponent {
  textoBusqueda: string = ''; // Guardará lo que escribas en el buscador

  productosCarrito = [
    { nombre: 'Paracetamol 500 mg', precio: 1200, cantidad: 1 },
    { nombre: 'Loratadina 10 mg', precio: 2000, cantidad: 2 },
    { nombre: 'Omeprazol 20 mg', precio: 3500, cantidad: 1 },
    { nombre: 'Ibuprofeno 400 mg', precio: 1500, cantidad: 3 }
  ];

  // Función para agregar el producto que escribiste
  agregarProducto() {
    if (this.textoBusqueda.trim() !== '') {
      this.productosCarrito.push({
        nombre: this.textoBusqueda,
        // Como no hay base de datos aún, le asignamos un precio aleatorio para la demostración
        precio: Math.floor(Math.random() * 5000) + 1000, 
        cantidad: 1
      });
      this.textoBusqueda = ''; // Limpia la barra de búsqueda
    }
  }

  // Función para eliminar un producto según su posición (índice)
  eliminarProducto(index: number) {
    this.productosCarrito.splice(index, 1);
  }

  getSubtotal(): number {
    return this.productosCarrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  }

  getImpuesto(): number {
    return this.getSubtotal() * 0.13;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getImpuesto();
  }
}