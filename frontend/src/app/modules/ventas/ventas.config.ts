import { ModuleConfig } from '../../shared/models/module-config';

export const VENTAS_CONFIG: ModuleConfig = {
    key:'ventas',title:'Ventas y facturación',subtitle:'Registra ventas, facturas y cobros',icon:'cart',
    button:'Nueva venta',search:'Buscar producto por nombre o código...',banner:'inventario-farmacia.jpg',
    stats:[{icon:'cart',label:'Ventas del día',value:'₡125.600'},{icon:'receipt',label:'Facturas emitidas',value:'48'},{icon:'coins',label:'Ventas del mes',value:'₡2.450.300'}],
    columns:['Código','Producto','Cantidad','Precio unitario','Subtotal'],
    rows:[['MED001','Paracetamol 500 mg','2','₡1.200','₡2.400'],['MED003','Ibuprofeno 400 mg','1','₡2.500','₡2.500'],['MED005','Loratadina 10 mg','1','₡1.800','₡1.800']]
  };
