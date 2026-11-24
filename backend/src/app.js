import express from 'express';
import cors from 'cors';
import inventarioRoutes from './modules/inventario/inventario.routes.js';
import ventasRoutes from './modules/ventas/ventas.routes.js';
import proveedoresRoutes from './modules/proveedores/proveedores.routes.js';
import crmRoutes from './modules/crm/crm.routes.js';
import contabilidadRoutes from './modules/contabilidad/contabilidad.routes.js';
import recursosHumanosRoutes from './modules/recursos-humanos/recursos-humanos.routes.js';
import { errorHandler } from './middleware/error-handler.js';
import authRoutes from './modules/auth/auth.routes.js';
import { autenticar } from './middleware/autenticar.js';
import usuariosRoutes from './modules/usuarios/usuarios.routes.js';

export const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:4200' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'HealKit API' }));
app.use('/api/auth', authRoutes);

// Proteger todas las operaciones de los módulos.
app.use('/api/inventario', autenticar, inventarioRoutes);
app.use('/api/ventas', autenticar, ventasRoutes);
app.use('/api/proveedores', autenticar, proveedoresRoutes);
app.use('/api/crm', autenticar, crmRoutes);
app.use('/api/contabilidad', autenticar, contabilidadRoutes);
app.use('/api/recursos-humanos', autenticar, recursosHumanosRoutes);
app.use('/api/usuarios', usuariosRoutes);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use(errorHandler);
