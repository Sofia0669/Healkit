import { ModuleConfig } from '../../shared/models/module-config';

export const INVENTARIO_CONFIG: ModuleConfig = {
    key: 'inventario', title: 'Inventario', subtitle: 'Control de productos, existencias y vencimientos',
    icon: 'package', button: 'Nuevo producto', search: 'Buscar por nombre, código o categoría...', banner: 'inventario-farmacia.jpg',
    stats: [
      {icon:'package', label:'Productos totales',value:'320'},
      {icon:'alert',label:'Stock bajo',value:'18'},
      {icon:'calendar',label:'Próximos a vencer',value:'12'},
      {icon:'ban',label:'Vencidos',value:'3'}
    ],
    columns: ['Código','Producto','Categoría','Presentación','Stock','Vencimiento','Estado'],
    statusIndex: 6,
    rows: [
      ['MED001','Paracetamol 500 mg','Analgésicos','Caja x 20','120','15/08/2028','Disponible'],
      ['MED002','Amoxicilina 500 mg','Antibióticos','Caja x 21','15','10/02/2026','Stock bajo'],
      ['MED003','Ibuprofeno 400 mg','Analgésicos','Caja x 20','60','05/01/2026','Vencido'],
      ['MED004','Omeprazol 20 mg','Gastrointestinal','Caja x 14','85','11/11/2028','Disponible'],
      ['MED005','Loratadina 10 mg','Antihistamínicos','Caja x 10','22','28/03/2026','Stock bajo']
    ]
  };
