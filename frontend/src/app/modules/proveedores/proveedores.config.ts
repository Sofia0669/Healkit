import { ModuleConfig } from '../../shared/models/module-config';

export const PROVEEDORES_CONFIG: ModuleConfig = {
    key:'proveedores',title:'Cadena de suministros y proveedores',subtitle:'Gestiona proveedores, órdenes de compra y recepción de mercadería',icon:'truck',
    button:'Nueva orden',search:'Buscar proveedor, orden o factura...',banner:'proveedores-farmacia.jpg',
    stats:[{icon:'users',label:'Proveedores activos',value:'24'},{icon:'calendar',label:'Órdenes pendientes',value:'8'},{icon:'package',label:'Pedidos en recepción',value:'3'},{icon:'coins',label:'Compras del mes',value:'₡2.450.300'}],
    columns:['Orden','Proveedor','Fecha','Entrega prevista','Total','Estado'],statusIndex:5,
    rows:[['OC-0018','Distribuidora Médica CR','24/10/2026','29/10/2026','₡185.000','Pendiente'],['OC-0017','Farmacéutica del Caribe','22/10/2026','27/10/2026','₡320.500','En tránsito'],['OC-0016','Suministros Saludables','20/10/2026','24/10/2026','₡95.800','Recibida'],['OC-0015','MedImport Costa Rica','18/10/2026','21/10/2026','₡410.000','Recibida']],
    footers:[{icon:'store',title:'Proveedores recientes',detail:'Distribuidora Médica CR'},{icon:'chart',title:'Historial de precios y entregas',detail:'Consultar reportes'}]
  };
