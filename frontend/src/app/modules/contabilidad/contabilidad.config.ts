import { ModuleConfig } from '../../shared/models/module-config';

export const CONTABILIDAD_CONFIG: ModuleConfig = {
    key:'contabilidad',title:'Contabilidad y finanzas',subtitle:'Controla ingresos, egresos y reportes financieros',icon:'database',button:'Nuevo registro',search:'Buscar movimiento...',
    stats:[{icon:'chart',label:'Ingresos del mes',value:'₡3.250.000'},{icon:'trend-down',label:'Egresos',value:'₡1.120.000'},{icon:'receipt',label:'Facturas pendientes',value:'12'},{icon:'coins',label:'Balance',value:'₡2.130.000'}],
    columns:['Fecha','Concepto','Tipo','Monto'],statusIndex:2,
    rows:[['22/10/2026','Venta de medicamentos','Ingreso','₡250.000'],['21/10/2026','Compra a proveedor','Egreso','₡410.000'],['20/10/2026','Servicios del local','Egreso','₡85.000'],['19/10/2026','Venta de productos','Ingreso','₡320.000']]
  };
