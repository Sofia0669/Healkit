import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CompraDetalle,
  CompraResumen,
  DatosProveedor,
  DetalleCompra,
  HistorialPrecio,
  ItemOrden,
  ItemRecepcion,
  ProductoCompra,
  Proveedor,
  ProveedoresApiService
} from '../../core/services/proveedores.api.service';

type Panel = 'ordenes' | 'proveedores' | 'historial';
type Modal = 'proveedor' | 'orden' | 'recepcion' | 'detalle' | null;

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.css'
})
export class ProveedoresComponent implements OnInit {
  private readonly api = inject(ProveedoresApiService);

  panel: Panel = 'ordenes';
  modal: Modal = null;
  proveedores: Proveedor[] = [];
  compras: CompraResumen[] = [];
  historial: HistorialPrecio[] = [];
  productos: ProductoCompra[] = [];
  proveedorCatalogo: { id: number; nombre: string }[] = [];
  compraSeleccionada: CompraDetalle | null = null;
  proveedorEditando: number | null = null;
  proveedorFiltro: number | null = null;
  consulta = '';
  cargando = false;
  guardando = false;
  error = '';
  aviso = '';

  proveedorForm: DatosProveedor = this.nuevoProveedor();
  ordenForm = {
    idProveedor: null as number | null,
    fechaEntregaPrevista: '',
    observaciones: ''
  };
  itemForm = {
    idProducto: null as number | null,
    cantidad: 1,
    costoUnitario: null as number | null
  };
  itemsOrden: ItemOrden[] = [];
  recepcionForm = {
    totalFactura: null as number | null
  };
  itemsRecepcion: ItemRecepcion[] = [];

  ngOnInit(): void {
    this.cargarDatos();
  }

  get proveedoresActivos(): number {
    return this.proveedores.filter((proveedor) => this.activo(proveedor)).length;
  }

  get ordenesPendientes(): number {
    return this.compras.filter((compra) =>
      ['BORRADOR', 'SOLICITADA', 'PARCIAL'].includes(compra.estado)
    ).length;
  }

  get porRecibir(): number {
    return this.compras.filter((compra) =>
      ['SOLICITADA', 'PARCIAL'].includes(compra.estado)
    ).length;
  }

  get comprasMes(): number {
    const ahora = new Date();
    return this.compras
      .filter((compra) => {
        const fecha = new Date(compra.fecha);
        return fecha.getMonth() === ahora.getMonth() &&
          fecha.getFullYear() === ahora.getFullYear();
      })
      .reduce((total, compra) => total + compra.total, 0);
  }

  get comprasFiltradas(): CompraResumen[] {
    const consulta = this.consulta.trim().toLocaleLowerCase();
    return this.compras.filter((compra) =>
      [String(compra.id_compra), compra.proveedor, compra.estado]
        .some((valor) => valor.toLocaleLowerCase().includes(consulta))
    );
  }

  get proveedoresFiltrados(): Proveedor[] {
    const consulta = this.consulta.trim().toLocaleLowerCase();
    return this.proveedores.filter((proveedor) =>
      [
        proveedor.nombre,
        proveedor.identificacion ?? '',
        proveedor.contacto ?? '',
        proveedor.correo ?? ''
      ].some((valor) => valor.toLocaleLowerCase().includes(consulta))
    );
  }

  get historialFiltrado(): HistorialPrecio[] {
    const consulta = this.consulta.trim().toLocaleLowerCase();
    return this.historial.filter((registro) =>
      [registro.proveedor, registro.producto]
        .some((valor) => valor.toLocaleLowerCase().includes(consulta))
    );
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = '';
    this.api.listarProveedores().subscribe({
      next: (proveedores) => {
        this.proveedores = proveedores;
        this.cargarCatalogo();
      },
      error: (error: unknown) => this.mostrarError(error)
    });
    this.api.listarCompras().subscribe({
      next: (compras) => {
        this.compras = compras;
        this.cargando = false;
      },
      error: (error: unknown) => this.mostrarError(error)
    });
    this.cargarHistorial();
  }

  cambiarPanel(panel: Panel): void {
    this.panel = panel;
    this.consulta = '';
  }

  abrirNuevoProveedor(): void {
    this.proveedorEditando = null;
    this.proveedorForm = this.nuevoProveedor();
    this.modal = 'proveedor';
  }

  editarProveedor(proveedor: Proveedor): void {
    this.proveedorEditando = proveedor.id_proveedor;
    this.proveedorForm = {
      nombre: proveedor.nombre,
      identificacion: proveedor.identificacion ?? '',
      telefono: proveedor.telefono ?? '',
      correo: proveedor.correo ?? '',
      direccion: proveedor.direccion ?? '',
      contacto: proveedor.contacto ?? '',
      condicionesPago: proveedor.condiciones_pago ?? '',
      plazoEntregaDias: proveedor.plazo_entrega_dias,
      activo: this.activo(proveedor)
    };
    this.modal = 'proveedor';
  }

  guardarProveedor(): void {
    this.guardando = true;
    const solicitud = this.proveedorEditando
      ? this.api.actualizarProveedor(this.proveedorEditando, this.proveedorForm)
      : this.api.crearProveedor(this.proveedorForm);
    solicitud.subscribe({
      next: () => {
        this.modal = null;
        this.guardando = false;
        this.aviso = 'Los datos del proveedor se guardaron correctamente.';
        this.cargarDatos();
      },
      error: (error: unknown) => {
        this.guardando = false;
        this.mostrarError(error);
      }
    });
  }

  abrirNuevaOrden(): void {
    this.ordenForm = {
      idProveedor: null,
      fechaEntregaPrevista: '',
      observaciones: ''
    };
    this.itemsOrden = [];
    this.itemForm = {
      idProducto: null,
      cantidad: 1,
      costoUnitario: null
    };
    this.modal = 'orden';
  }

  alCambiarProducto(): void {
    const producto = this.productos.find(
      (item) => item.id === Number(this.itemForm.idProducto)
    );
    if (producto) this.itemForm.costoUnitario = producto.precio_compra;
  }

  agregarItemOrden(): void {
    const producto = this.productos.find(
      (item) => item.id === Number(this.itemForm.idProducto)
    );
    if (!producto || !Number.isInteger(this.itemForm.cantidad) ||
        this.itemForm.cantidad < 1 ||
        this.itemForm.costoUnitario == null ||
        !Number.isFinite(this.itemForm.costoUnitario) ||
        this.itemForm.costoUnitario < 0) {
      this.error = 'Selecciona un producto e indica cantidad y costo válidos.';
      return;
    }
    if (this.itemsOrden.some((item) => item.idProducto === producto.id)) {
      this.error = 'Ese producto ya está agregado a la orden.';
      return;
    }
    this.error = '';
    this.itemsOrden = [
      ...this.itemsOrden,
      {
        idProducto: producto.id,
        cantidad: this.itemForm.cantidad,
        costoUnitario: this.itemForm.costoUnitario
      }
    ];
    this.itemForm = {
      idProducto: null,
      cantidad: 1,
      costoUnitario: null
    };
  }

  quitarItemOrden(index: number): void {
    this.itemsOrden = this.itemsOrden.filter((_, itemIndex) => itemIndex !== index);
  }

  guardarOrden(): void {
    if (!this.ordenForm.idProveedor || !this.itemsOrden.length) {
      this.error = 'Selecciona un proveedor y agrega al menos un producto.';
      return;
    }
    this.guardando = true;
    this.error = '';
    this.api.crearCompra({
  ...this.ordenForm,
  idProveedor: Number(this.ordenForm.idProveedor),
  observaciones: this.ordenForm.observaciones.trim(),
  items: this.itemsOrden
}).subscribe({
      next: () => {
        this.modal = null;
        this.guardando = false;
        this.aviso = 'Orden creada en estado borrador.';
        this.cargarDatos();
      },
      error: (error: unknown) => {
        this.guardando = false;
        this.mostrarError(error);
      }
    });
  }

  abrirOrden(compra: CompraResumen): void {
    this.api.obtenerCompra(compra.id_compra).subscribe({
      next: (detalle) => {
        this.compraSeleccionada = detalle;
        this.modal = 'detalle';
      },
      error: (error: unknown) => this.mostrarError(error)
    });
  }

  aprobarOrden(compra: CompraResumen): void {
    this.api.aprobarCompra(compra.id_compra).subscribe({
      next: () => {
        this.aviso = `La orden OC-${compra.id_compra} fue aprobada y enviada al proveedor.`;
        this.cargarDatos();
      },
      error: (error: unknown) => this.mostrarError(error)
    });
  }

  prepararRecepcion(compra: CompraDetalle): void {
    this.compraSeleccionada = compra;
    this.recepcionForm = { totalFactura: null };
    this.itemsRecepcion = compra.items
      .filter((item) => item.cantidad_solicitada > item.cantidad_recibida)
      .map((item) => ({
        idDetalleCompra: item.id_detalle_compra,
        cantidad: item.cantidad_solicitada - item.cantidad_recibida,
        costoUnitario: item.costo_unitario,
        numeroLote: '',
        fechaVencimiento: ''
      }));
    this.modal = 'recepcion';
  }

  recibirOrden(): void {
    if (!this.compraSeleccionada || this.recepcionForm.totalFactura == null) return;
    const items = this.itemsRecepcion.filter((item) => item.cantidad > 0);
    if (!items.length || items.some((item) =>
      !item.numeroLote.trim() || !item.fechaVencimiento
    )) {
      this.error = 'Completa cantidad, lote y vencimiento de cada producto recibido.';
      return;
    }
    this.guardando = true;
    this.error = '';
    this.api.recibirCompra(this.compraSeleccionada.id_compra, {
      totalFactura: this.recepcionForm.totalFactura,
      items
    }).subscribe({
      next: (compra) => {
        this.modal = null;
        this.guardando = false;
        this.compraSeleccionada = compra;
        this.aviso = `Recepción registrada con factura interna ${compra.recepciones[0].numero_factura}.`;
        this.cargarDatos();
      },
      error: (error: unknown) => {
        this.guardando = false;
        this.mostrarError(error);
      }
    });
  }

  alCambiarFiltroHistorial(): void {
    this.cargarHistorial();
  }

  estadoTexto(estado: string): string {
    const etiquetas: Record<string, string> = {
      BORRADOR: 'Borrador',
      SOLICITADA: 'Aprobada',
      PARCIAL: 'Recepción parcial',
      RECIBIDA: 'Recibida',
      ANULADA: 'Anulada'
    };
    return etiquetas[estado] ?? estado;
  }

  formatoDinero(valor: number | null | undefined): string {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      maximumFractionDigits: 2
    }).format(Number(valor ?? 0));
  }

  formatoFecha(valor: string | null | undefined): string {
    if (!valor) return '—';
    const fecha = new Date(valor);
    return Number.isNaN(fecha.getTime()) ? '—' :
      fecha.toLocaleDateString('es-CR');
  }

  nombreProducto(id: number): string {
    return this.productos.find((producto) => producto.id === id)?.nombre ??
      'Producto';
  }

  detalleOrden(idDetalle: number): DetalleCompra | undefined {
    return this.compraSeleccionada?.items.find(
      (item) => item.id_detalle_compra === idDetalle
    );
  }

  totalOrden(): number {
    return this.itemsOrden.reduce(
      (total, item) => total + item.cantidad * item.costoUnitario,
      0
    );
  }

  totalRecepcion(item: ItemRecepcion): number {
    return item.cantidad * item.costoUnitario;
  }

  totalProductosRecepcion(items: ItemRecepcion[]): number {
    return items.reduce((total, item) => total + this.totalRecepcion(item), 0);
  }

  private cargarCatalogo(): void {
    this.api.obtenerCatalogo().subscribe({
      next: (catalogo) => {
        this.proveedorCatalogo = catalogo.proveedores;
        this.productos = catalogo.productos;
      },
      error: (error: unknown) => this.mostrarError(error)
    });
  }

  private cargarHistorial(): void {
    this.api.historialPrecios(this.proveedorFiltro ?? undefined).subscribe({
      next: (historial) => {
        this.historial = historial;
        this.cargando = false;
      },
      error: (error: unknown) => this.mostrarError(error)
    });
  }

  private nuevoProveedor(): DatosProveedor {
    return {
      nombre: '',
      identificacion: '',
      telefono: '',
      correo: '',
      direccion: '',
      contacto: '',
      condicionesPago: '',
      plazoEntregaDias: null,
      activo: true
    };
  }

  activo(proveedor: Proveedor): boolean {
    return proveedor.activo === true || proveedor.activo === 1;
  }

  private mostrarError(error: unknown): void {
    const response = error as {
      error?: { mensaje?: string };
      message?: string;
    };
    this.error = response.error?.mensaje ??
      response.message ??
      'No se pudo completar la operación. Inténtalo nuevamente.';
    this.cargando = false;
  }
}
