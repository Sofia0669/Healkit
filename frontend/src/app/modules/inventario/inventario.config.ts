
import { ModuleConfig } from '../../shared/models/module-config';

export const INVENTARIO_CONFIG: ModuleConfig = {
  key: 'inventario',
  title: 'Inventario',
  subtitle: 'Control de productos, existencias y vencimientos',
  icon: 'package',
  button: 'Nuevo producto',
  search: 'Buscar por nombre, código o categoría...',
  banner: 'inventario-farmacia.jpg',

  stats: [
    {icon: 'package', label: 'Productos totales', value: '0'},
    {icon: 'alert', label: 'Stock bajo', value: '0'},
    {icon: 'calendar', label: 'Próximos a vencer', value: '0'},
    {icon: 'ban', label: 'Vencidos', value: '0'}
  ],

  columns: [
    'Código',
    'Producto',
    'Categoría',
    'Presentación',
    'Stock',
    'Vencimiento',
    'Estado'
  ],

  statusIndex: 6,

  // Los registros se cargarán desde MySQL.
  rows: []
};
