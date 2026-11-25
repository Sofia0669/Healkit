
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  presentacion: string;
  stockActual: number;
  stockMinimo: number;
  vencimiento: string | null;
  activo: boolean;
}

export interface DatosProducto {
  codigo: string;
  nombre: string;
  idCategoria: number;
  presentacion: string;
  stockMinimo: number;
}

@Injectable({
  providedIn: 'root'
})
export class InventarioApiService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:3000/api/inventario';

  listar(): Observable<Producto[]> {
    return this.http.get<unknown>(this.apiUrl).pipe(
      map((respuesta) => {
        const datos = respuesta as any;

        const registros = Array.isArray(datos)
          ? datos
          : datos?.datos?.productos
            ?? datos?.productos
            ?? datos?.datos;

        if (!Array.isArray(registros)) {
          throw new Error(
            'El backend no devolvió una lista válida de productos.'
          );
        }

        return registros.map((p: any) => ({
          id: Number(p.id ?? p.id_producto),
          codigo: String(p.codigo ?? ''),
          nombre: String(p.nombre ?? ''),
          categoria: String(
            p.categoria ?? p.nombre_categoria ?? 'Sin categoría'
          ),
          presentacion: String(p.presentacion ?? 'Sin presentación'),
          stockActual: Number(p.stockActual ?? p.stock_actual ?? 0),
          stockMinimo: Number(p.stockMinimo ?? p.stock_minimo ?? 0),
          vencimiento: p.vencimiento ?? p.fecha_vencimiento ?? null,
          activo: p.activo !== false && p.activo !== 0
        }));
      })
    );
  }

  obtenerPorId(id: number): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  crear(datos: DatosProducto): Observable<unknown> {
    return this.http.post(this.apiUrl, datos);
  }

  actualizar(
    id: number,
    datos: DatosProducto
  ): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/${id}`, datos);
  }

  eliminar(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
