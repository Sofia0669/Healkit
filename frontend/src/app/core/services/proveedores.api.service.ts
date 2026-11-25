import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Proveedor {
  id_proveedor: number;
  nombre: string;
  identificacion: string | null;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  contacto: string | null;
  condiciones_pago: string | null;
  plazo_entrega_dias: number | null;
  activo: boolean | number;
}

export interface ProductoCompra {
  id: number;
  codigo: string;
  nombre: string;
  precio_compra: number;
}

export interface CompraResumen {
  id_compra: number;
  id_proveedor: number;
  proveedor: string;
  fecha: string;
  fecha_entrega_prevista: string | null;
  estado: 'BORRADOR' | 'SOLICITADA' | 'PARCIAL' | 'RECIBIDA' | 'ANULADA';
  total: number;
  total_facturado: number;
}

export interface DetalleCompra {
  id_detalle_compra: number;
  id_producto: number;
  codigo: string;
  producto: string;
  cantidad_solicitada: number;
  costo_unitario: number;
  subtotal: number;
  cantidad_recibida: number;
}

export interface DetalleRecepcion {
  id_recepcion: number;
  id_detalle_compra: number;
  cantidad: number;
  costo_unitario: number;
  numero_lote: string;
  fecha_vencimiento: string;
  producto: string;
}

export interface RecepcionCompra {
  id_recepcion: number;
  numero_factura: string;
  fecha_recepcion: string;
  total_factura: number;
  recibido_por: string | null;
  items: DetalleRecepcion[];
  total_productos: number;
  diferencia_factura: number;
}

export interface CompraDetalle extends CompraResumen {
  observaciones: string | null;
  creado_por: string | null;
  aprobado_por: string | null;
  fecha_aprobacion: string | null;
  fecha_recepcion: string | null;
  items: DetalleCompra[];
  recepciones: RecepcionCompra[];
}

export interface HistorialPrecio {
  id_proveedor: number;
  proveedor: string;
  id_producto: number;
  producto: string;
  recepciones: number;
  precio_promedio: number;
  precio_minimo: number;
  precio_maximo: number;
  ultimo_precio: number;
  demora_promedio_dias: number | null;
  ultima_recepcion: string;
}

export interface DatosProveedor {
  nombre: string;
  identificacion: string;
  telefono: string;
  correo: string;
  direccion: string;
  contacto: string;
  condicionesPago: string;
  plazoEntregaDias: number | null;
  activo: boolean;
}

export interface ItemOrden {
  idProducto: number;
  cantidad: number;
  costoUnitario: number;
}

export interface ItemRecepcion {
  idDetalleCompra: number;
  cantidad: number;
  costoUnitario: number;
  numeroLote: string;
  fechaVencimiento: string;
}

@Injectable({ providedIn: 'root' })
export class ProveedoresApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/proveedores';

  listarProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.apiUrl);
  }

  crearProveedor(datos: DatosProveedor): Observable<Proveedor> {
    return this.http.post<Proveedor>(this.apiUrl, datos);
  }

  actualizarProveedor(
    id: number,
    datos: DatosProveedor
  ): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.apiUrl}/${id}`, datos);
  }

  obtenerCatalogo(): Observable<{
    proveedores: { id: number; nombre: string }[];
    productos: ProductoCompra[];
  }> {
    return this.http.get<{
      proveedores: { id: number; nombre: string }[];
      productos: ProductoCompra[];
    }>(`${this.apiUrl}/catalogo`);
  }

  listarCompras(): Observable<CompraResumen[]> {
    return this.http.get<CompraResumen[]>(`${this.apiUrl}/compras`);
  }

  obtenerCompra(id: number): Observable<CompraDetalle> {
    return this.http.get<CompraDetalle>(`${this.apiUrl}/compras/${id}`);
  }

  crearCompra(datos: {
    idProveedor: number;
    fechaEntregaPrevista: string | null;
    observaciones: string;
    items: ItemOrden[];
  }): Observable<CompraDetalle> {
    return this.http.post<CompraDetalle>(`${this.apiUrl}/compras`, datos);
  }

  aprobarCompra(id: number): Observable<CompraDetalle> {
    return this.http.post<CompraDetalle>(
      `${this.apiUrl}/compras/${id}/aprobar`,
      {}
    );
  }

  recibirCompra(
    id: number,
    datos: {
      totalFactura: number;
      items: ItemRecepcion[];
    }
  ): Observable<CompraDetalle> {
    return this.http.post<CompraDetalle>(
      `${this.apiUrl}/compras/${id}/recepciones`,
      datos
    );
  }

  historialPrecios(idProveedor?: number): Observable<HistorialPrecio[]> {
    const url = idProveedor
      ? `${this.apiUrl}/historial-precios?idProveedor=${idProveedor}`
      : `${this.apiUrl}/historial-precios`;
    return this.http.get<HistorialPrecio[]>(url);
  }
}
