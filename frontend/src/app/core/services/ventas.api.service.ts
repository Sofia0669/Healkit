import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface VentaResumen {
  id: number;
  numeroFactura: string;
  fecha: string;
  total: string;
  metodoPago: string;
  estado: string;
  cliente: string | null;
  vendedor: string | null;
}

export interface DetalleVenta {
  codigo: string;
  nombre: string;
  cantidad: number;
  precioUnitario: string;
  subtotal: string;
}

export interface VentaDetalle extends VentaResumen {
  subtotal: string;
  impuesto: string;
  identificacionCliente: string | null;
  correoCliente: string | null;
  detalles: DetalleVenta[];
}

export interface ReportesVentas {
  desde: string;
  hasta: string;
  resumen: { cantidadVentas: number; totalVendido: string };
  porDia: { dia: string; cantidadVentas: number; total: string }[];
  productosMasVendidos: { codigo: string; nombre: string; unidades: string; total: string }[];
  porMetodoPago: { metodoPago: string; cantidadVentas: number; total: string }[];
  porVendedor: { vendedor: string; cantidadVentas: number; total: string }[];
}

export interface ProductoVenta {
  id: number;
  codigo: string;
  nombre: string;
  precioVenta: string;
  stock: number;
}

export interface ClienteVenta {
  id: number;
  identificacion: string | null;
  nombre: string;
}

export interface NuevaVenta {
  idCliente: number | null;
  metodoPago: string;
  items: { idProducto: number; cantidad: number }[];
}

@Injectable({ providedIn: 'root' })
export class VentasApiService {
  private http = inject(HttpClient);
  private readonly api = 'http://localhost:3000/api/ventas';

  listar() { return this.http.get<VentaResumen[]>(this.api); }
  obtener(id: number) { return this.http.get<VentaDetalle>(`${this.api}/${id}`); }
  descargarPdf(id: number) { return this.http.get(`${this.api}/${id}/factura/pdf`, { responseType: 'blob' }); }
  crear(venta: NuevaVenta) { return this.http.post<VentaDetalle>(this.api, venta); }
  buscarProductos(q: string) { return this.http.get<ProductoVenta[]>(`${this.api}/productos`, { params: { q } }); }
  anular(id: number, motivo: string) { return this.http.patch<VentaDetalle>(`${this.api}/${id}/anular`, { motivo }); }
  reportes(desde: string, hasta: string) {
    const params: Record<string, string> = {};
    if (desde) params['desde'] = desde;
    if (hasta) params['hasta'] = hasta;
    return this.http.get<ReportesVentas>(`${this.api}/reportes`, { params });
  }
  listarClientes() { return this.http.get<ClienteVenta[]>(`${this.api}/clientes`); }
}
