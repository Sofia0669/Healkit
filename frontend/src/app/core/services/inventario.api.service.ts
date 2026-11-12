import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface ProductoApi {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  presentacion: string;
  stock: number;
  stockMinimo: number;
  vencimiento: string | null;
}

@Injectable({ providedIn: 'root' })
export class InventarioApiService {
  private http = inject(HttpClient);
  private readonly api = 'http://localhost:3000/api/inventario';

  listar() { return this.http.get<ProductoApi[]>(this.api); }
  obtener(id: number) { return this.http.get<ProductoApi>(`${this.api}/${id}`); }
  crear(p: Omit<ProductoApi, 'id'>) { return this.http.post<ProductoApi>(this.api, p); }
  actualizar(id: number, p: Omit<ProductoApi, 'id'>) { return this.http.put<ProductoApi>(`${this.api}/${id}`, p); }
  eliminar(id: number) { return this.http.delete<void>(`${this.api}/${id}`); }
}
