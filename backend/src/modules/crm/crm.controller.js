import { consultarEstado } from './crm.service.js';
export function pendiente(_req, res) {
  res.status(501).json({ ...consultarEstado(), mensaje: 'Módulo MVC preparado; API pendiente de implementar' });
}
