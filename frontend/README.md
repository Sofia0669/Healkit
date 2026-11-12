# HealKit Pharmacy — Diseño limpio (Angular)

Incluye las ocho pantallas acordadas: Login, Inicio, Inventario, Ventas, Proveedores, CRM, Contabilidad y Recursos Humanos.

## Requisitos

- Node.js LTS compatible con Angular 20
- npm

## Instalación

```bash
npm install
npm start
```

Abrir `http://localhost:4200`. El Login permite entrar sin credenciales porque es **un prototipo visual**, no autenticación real.

## Organización de archivos

- `src/app/app.ts` — rutas, login, menú y comportamiento compartido de módulos.
- `src/app/data.ts` — configuraciones, indicadores y tablas de cada módulo. **Aquí cambia el contenido cada integrante.**
- `src/app/login.html` — pantalla de acceso.
- `src/app/shell.html` — menú y cabecera reutilizables.
- `src/app/home.html` — Inicio + Misión y Visión.
- `src/app/module.html` — plantilla compartida para seis módulos.
- `src/app/icons.ts` — íconos SVG.
- `src/styles.css` — colores, tipografía y componentes visuales compartidos.
- `public/assets/` — imágenes recortadas de las referencias aprobadas.

## Rutas

- `/login`
- `/inicio`
- `/inventario`
- `/ventas`
- `/proveedores`
- `/crm`
- `/contabilidad`
- `/rrhh`

## Alcance real

- Navegación, búsqueda, filtro por estado, ventana de nuevo/editar y detalles visuales.
- Los registros editados existen solamente en memoria y **se pierden al recargar**.
- No hay autenticación, Node.js backend, MySQL ni facturación fiscal.
- Las imágenes del encabezado reutilizan partes de referencias visuales; se pueden sustituir en `public/assets/`.
- Cifras y tablas son datos ficticios para el prototipo.

## GitHub

Crea un repositorio vacío, luego en la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Crear diseño ligero de HealKit"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/HealKit-ERP.git
git push -u origin main
```

No agregues `node_modules`, contraseñas ni claves; `.gitignore` ya los excluye.

## Para integrar con tu proyecto existente

La descarga es un proyecto independiente. **No sobrescribas** tus cambios de `src/app` si ya trabajas con compañeros: primero copia los componentes y estilos a una rama, prueba el resultado y resuelve las diferencias de rutas.
