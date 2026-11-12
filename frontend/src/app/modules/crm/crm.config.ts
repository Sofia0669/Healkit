import { ModuleConfig } from '../../shared/models/module-config';

export const CRM_CONFIG: ModuleConfig = {
    key:'crm',title:'CRM y clientes',subtitle:'Gestiona información y seguimiento de clientes',icon:'users',button:'Nuevo cliente',search:'Buscar cliente por nombre, cédula o correo...',
    stats:[{icon:'users',label:'Clientes activos',value:'245'},{icon:'award',label:'Frecuentes',value:'82'},{icon:'user-plus',label:'Nuevos del mes',value:'18'}],
    columns:['Nombre','Cédula','Teléfono','Correo','Tipo','Última compra'],statusIndex:4,
    rows:[['María González','1-2345-6789','8888-1234','maria@gcorreo.com','Frecuente','20/10/2026'],['Carlos Méndez','1-5678-9012','8777-5678','carlos@gcorreo.com','Activo','18/10/2026'],['Lucía Ramírez','1-3456-7890','8333-9012','lucia@gcorreo.com','Frecuente','15/10/2026'],['José Herrera','1-6789-0123','8999-4455','jose@gcorreo.com','Activo','10/10/2026'],['Ana Torres','1-8901-2345','8222-7788','ana@gcorreo.com','Nuevo','—']],
    footers:[{icon:'target',title:'Segmentos',detail:'Clasifica a tus clientes en grupos'},{icon:'heart',title:'Seguimiento y fidelización',detail:'Recordatorios y promociones'}]
  };
