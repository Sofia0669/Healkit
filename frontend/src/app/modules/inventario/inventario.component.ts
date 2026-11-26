
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HkIconComponent } from
  '../../shared/icons/hk-icon.component';

import { AuthService } from
  '../../core/services/auth.service';

import {
  InventarioApiService,
  Producto,
  DatosProducto,
  Categoria,
  Proveedor
} from '../../core/services/inventario.api.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HkIconComponent
  ],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent implements OnInit {

  private readonly inventarioApi = inject(InventarioApiService);
  private readonly auth = inject(AuthService);

  productos: Producto[] = [];

  busqueda = '';
  filtro = 'Todos';

  cargando = false;
  guardando = false;

  error = '';
  mensaje = '';

  mostrarFormulario = false;
  productoEditando: number | null = null;
  productoDetalle: Producto | null = null;

  formulario: DatosProducto = this.formularioVacio();

categorias: Categoria[] = [];
proveedores: Proveedor[] = [];

cargarCategorias(): void {
  this.inventarioApi.listarCategorias().subscribe({
    next: categorias => {
      this.categorias = categorias;
    },
    error: () => {
      this.error = 'No se pudieron cargar las categorías.';
    }
  });
}

cargarProveedores(): void {
  this.inventarioApi.listarProveedores().subscribe({
    next: proveedores => {
      this.proveedores = proveedores;
    },
    error: () => {
      this.error = 'No se pudieron cargar los proveedores.';
    }
  });
}

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarCategorias();
  this.cargarProveedores();
  }

  // PERMISOS

  get puedeModificar(): boolean {
    const rol = this.auth.usuarioActual?.rol;

    return rol === 'Administrador General' ||
      rol === 'Administrador' ||
      rol === 'Encargado de Farmacia';
  }

  // CARGAR PRODUCTOS

  cargarProductos(): void {
    this.cargando = true;
    this.error = '';

    this.inventarioApi.listar().subscribe({
      next: productos => {
        this.productos = productos.filter(p => p.activo);
        this.cargando = false;
      },
      error: err => {
        this.cargando = false;
        this.error =
          err.error?.mensaje ||
          err.message ||
          'No se pudieron cargar los productos.';
      }
    });
  }

  // ESTADÍSTICAS

  get totalProductos(): number {
    return this.productos.length;
  }

  get stockBajo(): number {
    return this.productos.filter(
      p => p.stockActual > 0 &&
           p.stockActual <= p.stockMinimo
    ).length;
  }

  get sinExistencias(): number {
    return this.productos.filter(
      p => p.stockActual === 0
    ).length;
  }

  get valorInventario(): number {
    return this.productos.reduce(
      (total, p) => total + p.precioCompra * p.stockActual,
      0
    );
  }

  // BUSCADOR Y FILTRO

  get productosFiltrados(): Producto[] {
    const texto = this.busqueda.trim().toLowerCase();

    return this.productos.filter(p => {
      const coincideBusqueda =
        p.codigo.toLowerCase().includes(texto) ||
        p.nombre.toLowerCase().includes(texto) ||
        this.obtenerNombreCategoria(p.idCategoria)
    .toLowerCase()
    .includes(texto);

      const coincideFiltro =
        this.filtro === 'Todos' ||
        this.obtenerEstado(p) === this.filtro;

      return coincideBusqueda && coincideFiltro;
    });
  }

  obtenerEstado(producto: Producto): string {
    if (producto.stockActual <= 0) {
      return 'Agotado';
    }

    if (producto.stockActual <= producto.stockMinimo) {
      return 'Stock bajo';
    }

    return 'Disponible';
  }

  // FORMULARIO

  private formularioVacio(): DatosProducto {
    return {
      codigo: '',
      nombre: '',
      descripcion: '',
      idCategoria: 0,
      idProveedor: 0,
      precioCompra: 0,
      precioVenta: 0,
      stockActual: 0,
      stockMinimo: 0,
      requiereReceta: false
    };
  }

  nuevoProducto(): void {
    if (!this.puedeModificar) return;

    this.formulario = this.formularioVacio();
    this.productoEditando = null;

    this.error = '';
    this.mensaje = '';
    this.mostrarFormulario = true;
  }

  editarProducto(producto: Producto): void {
    if (!this.puedeModificar) return;

    this.productoEditando = producto.id;

    this.formulario = {
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      idCategoria: producto.idCategoria,
      idProveedor: producto.idProveedor,
      precioCompra: producto.precioCompra,
      precioVenta: producto.precioVenta,
      stockActual: producto.stockActual,
      stockMinimo: producto.stockMinimo,
      requiereReceta: producto.requiereReceta
    };

    this.error = '';
    this.mensaje = '';
    this.mostrarFormulario = true;
  }

  verProducto(producto: Producto): void {
    this.productoDetalle = producto;
  }

  cerrarFormulario(): void {
    if (this.guardando) return;

    this.mostrarFormulario = false;
    this.productoEditando = null;
  }

  // GUARDAR EN MYSQL

  guardarProducto(): void {
    if (!this.puedeModificar || this.guardando) return;

    this.error = '';

    const datos: DatosProducto = {
      ...this.formulario,
      codigo: this.formulario.codigo.trim(),
      nombre: this.formulario.nombre.trim(),
      descripcion: this.formulario.descripcion.trim()
    };

    if (!datos.codigo || !datos.nombre) {
      this.error = 'Debes ingresar el código y nombre del producto.';
      return;
    }

    if (
      !Number.isInteger(datos.idCategoria) ||
      datos.idCategoria <= 0 ||
      !Number.isInteger(datos.idProveedor) ||
      datos.idProveedor <= 0
    ) {
      this.error = 'Selecciona una categoría y proveedor válidos.';
      return;
    }

    if (
      !Number.isFinite(datos.precioCompra) ||
      !Number.isFinite(datos.precioVenta) ||
      datos.precioCompra < 0 ||
      datos.precioVenta < 0 ||
      !Number.isInteger(datos.stockActual) ||
      !Number.isInteger(datos.stockMinimo) ||
      datos.stockActual < 0 ||
      datos.stockMinimo < 0
    ) {
      this.error = 'Revisa los precios y las cantidades ingresadas.';
      return;
    }

    this.guardando = true;

    const solicitud = this.productoEditando === null
      ? this.inventarioApi.crear(datos)
      : this.inventarioApi.actualizar(
          this.productoEditando,
          datos
        );

    solicitud.subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarFormulario = false;
        this.productoEditando = null;

        this.mensaje = 'Producto guardado correctamente.';
        this.cargarProductos();
      },
      error: err => {
        this.guardando = false;

        this.error =
          err.error?.mensaje ||
          err.error?.error ||
          'No se pudo guardar el producto en MySQL.';
      }
    });
  }

  // DESACTIVAR PRODUCTO

  eliminarProducto(producto: Producto): void {
    if (!this.puedeModificar) return;

    const confirmar = confirm(
      `¿Deseas desactivar el producto "${producto.nombre}"?`
    );

    if (!confirmar) return;

    this.inventarioApi.eliminar(producto.id).subscribe({
      next: () => {
        this.mensaje = 'Producto desactivado correctamente.';
        this.cargarProductos();
      },
      error: err => {
        this.error =
          err.error?.mensaje ||
          'No se pudo desactivar el producto.';
      }
    });
  }

  // FORMATO DE COLONES

  dinero(valor: number): string {
    return '₡' + new Intl.NumberFormat('es-CR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor);
  }


obtenerNombreCategoria(idCategoria: number): string {
  const categoria = this.categorias.find(
    c => c.id === idCategoria
  );

  return categoria?.nombre ?? 'Sin categoría';
}

obtenerNombreProveedor(idProveedor: number): string {
  const proveedor = this.proveedores.find(
    p => p.id === idProveedor
  );

  return proveedor?.nombre ?? 'Sin proveedor';
}

}

