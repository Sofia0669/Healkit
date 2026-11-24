
export class Producto {
  constructor(datos) {
    this.id = datos.id ?? null;
    this.codigo = datos.codigo;
    this.nombre = datos.nombre;
    this.descripcion = datos.descripcion ?? null;
    this.idCategoria = datos.idCategoria ?? null;
    this.idProveedor = datos.idProveedor ?? null;
    this.precioCompra = datos.precioCompra;
    this.precioVenta = datos.precioVenta;
    this.stock = datos.stock;
    this.stockMinimo = datos.stockMinimo;
    this.requiereReceta = datos.requiereReceta ?? false;
  }
}
