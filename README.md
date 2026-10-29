# HealKit Pharmacy — Angular (Login, Inicio e Inventario)

Proyecto de prototipo visual basado en las tres imágenes aprobadas de HealKit. **No es una captura estática**: el login, la navegación, la tabla, los filtros y el formulario son HTML/Angular reales; algunas piezas ilustradas proceden de los diseños de referencia para acercar el aspecto al modelo.

## Ejecutar

Instala Node.js 20.19+ o una versión compatible con Angular 20. Dentro de esta carpeta:

```bash
npm install
npm start
```

Abre http://localhost:4200.

- `/login`: acceso demostrativo (sin autenticación real) → `/inicio`.
- `/inicio`: panel de bienvenida y 3 tarjetas de ejemplo.
- `/inventario`: indicadores, búsqueda, filtrado y altas/ediciones/eliminación en memoria.

Los otros dos módulos del equipo podrán añadirse como rutas a `src/app/app.routes.ts`, enlazarse desde `src/app/shared/layout/` y reutilizar `src/styles.css`.

## Estructura

- `src/styles.css`: paleta, variables, estilos globales y componentes básicos.
- `src/app/shared/layout/`: menú lateral + barra superior compartidos.
- `src/app/shared/hk-icon/`: iconos SVG coherentes sin bibliotecas adicionales.
- `src/app/pages/login/`: pantalla login.
- `src/app/pages/inicio/`: pantalla inicio.
- `src/app/pages/inventario/`: inventario interactivo de prototipo.
- `public/assets/`: logo, fondos y recortes visuales del diseño aprobado.

**Tecnologías:** Angular frontend; Node.js se utiliza para el entorno de desarrollo. MySQL todavía no está conectado. El backend Node.js y la autenticación segura deben desarrollarse posteriormente. Los datos del ejemplo no son registros reales.
