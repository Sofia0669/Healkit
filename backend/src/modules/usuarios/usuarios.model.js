
export class Usuario {
  constructor(datos) {
    this.id = datos.id_usuario;
    this.nombre = datos.nombre;
    this.correo = datos.correo;
    this.idRol = datos.id_rol;
    this.rol = datos.rol;
    this.activo = Boolean(datos.activo);
    this.creadoEn = datos.creado_en;
  }
}
