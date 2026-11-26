
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  idCategoria: number;
  idProveedor: number;
  categoria: string;
  proveedor: string;
  precioCompra: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
  requiereReceta: boolean;
  activo: boolean;
}

export interface DatosProducto {
  codigo: string;
  nombre: string;
  descripcion: string;
  idCategoria: number;
  idProveedor: number;
  precioCompra: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
  requiereReceta: boolean;
}

export interface Categoria {
  id: number;
  nombre: string;
}

export interface Proveedor {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventarioApiService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:3000/api/inventario';

  // OBTENER CATEGORÍAS
  listarCategorias(): Observable<Categoria[]> {
    return this.http.get<{ categorias: Categoria[] }>(
      `${this.apiUrl}/categorias`
    ).pipe(
      map(respuesta => respuesta.categorias)
    );
  }

  // OBTENER PROVEEDORES ACTIVOS
  listarProveedores(): Observable<Proveedor[]> {
    return this.http.get<{ proveedores: Proveedor[] }>(
      `${this.apiUrl}/proveedores`
    ).pipe(
      map(respuesta => respuesta.proveedores)
    );
  }

  // CONVERTIR RESPUESTA DEL BACKEND
  private convertirProducto(p: any): Producto {
    return {
      id: Number(p.id ?? p.idProducto ?? p.id_producto),
      codigo: String(p.codigo ?? ''),
      nombre: String(p.nombre ?? ''),
      descripcion: String(p.descripcion ?? ''),

      idCategoria: Number(
        p.idCategoria ?? p.id_categoria ?? 0
      ),

      idProveedor: Number(
        p.idProveedor ?? p.id_proveedor ?? 0
      ),

      categoria: String(
        p.categoria ?? p.nombre_categoria ?? ''
      ),

      proveedor: String(
        p.proveedor ?? p.nombre_proveedor ?? ''
      ),

      precioCompra: Number(
        p.precioCompra ?? p.precio_compra ?? 0
      ),

      precioVenta: Number(
        p.precioVenta ?? p.precio_venta ?? 0
      ),

      // El backend devuelve "stock".
      stockActual: Number(
        p.stock ?? p.stockActual ?? p.stock_actual ?? 0
      ),

      stockMinimo: Number(
        p.stockMinimo ?? p.stock_minimo ?? 0
      ),

      requiereReceta: Boolean(
        Number(p.requiereReceta ?? p.requiere_receta ?? 0)
      ),

      activo: p.activo === undefined
        ? true
        : Boolean(Number(p.activo))
    };
  }

  // LISTAR PRODUCTOS
  listar(): Observable<Producto[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(respuesta => {
        const registros = Array.isArray(respuesta)
          ? respuesta
          : respuesta?.datos?.productos
            ?? respuesta?.productos
            ?? respuesta?.datos;

        if (!Array.isArray(registros)) {
          throw new Error(
            'La API no devolvió una lista válida de productos.'
          );
        }

        return registros.map(p => this.convertirProducto(p));
      })
    );
  }

  // REGISTRAR PRODUCTO
  crear(datos: DatosProducto): Observable<unknown> {
    const cuerpo = {
      codigo: datos.codigo,
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      idCategoria: Number(datos.idCategoria),
      idProveedor: Number(datos.idProveedor),
      precioCompra: Number(datos.precioCompra),
      precioVenta: Number(datos.precioVenta),
      stock: Number(datos.stockActual),
      stockMinimo: Number(datos.stockMinimo),
      requiereReceta: datos.requiereReceta
    };

    return this.http.post(this.apiUrl, cuerpo);
  }

  // ACTUALIZAR PRODUCTO
  actualizar(
    id: number,
    datos: DatosProducto
  ): Observable<unknown> {
    const cuerpo = {
      codigo: datos.codigo,
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      idCategoria: Number(datos.idCategoria),
      idProveedor: Number(datos.idProveedor),
      precioCompra: Number(datos.precioCompra),
      precioVenta: Number(datos.precioVenta),
      stock: Number(datos.stockActual),
      stockMinimo: Number(datos.stockMinimo),
      requiereReceta: datos.requiereReceta
    };

    return this.http.put(
      `${this.apiUrl}/${id}`,
      cuerpo
    );
  }

  // DESACTIVAR PRODUCTO
  eliminar(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
