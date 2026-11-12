import { ModuleConfig } from '../../shared/models/module-config';

export const RRHH_CONFIG: ModuleConfig = {
    key:'rrhh',title:'Recursos Humanos',subtitle:'Administra personal, horarios y asistencia',icon:'briefcase',button:'Nuevo empleado',search:'Buscar empleado...',
    stats:[{icon:'users',label:'Empleados activos',value:'18'},{icon:'calendar',label:'Asistencia',value:'96%'},{icon:'sun',label:'Vacaciones',value:'4'},{icon:'database',label:'Nóminas',value:'2'}],
    columns:['Nombre','Cargo','Horario','Estado','Ingreso'],statusIndex:3,
    rows:[['María Torres','Farmacéutica','08:00 – 16:00','Activo','15/03/2024'],['Carlos Méndez','Auxiliar de farmacia','14:00 – 22:00','Activo','07/06/2024'],['Lucía Herrera','Cajera','08:00 – 16:00','Activo','02/01/2025'],['Andrés Silva','Almacenista','08:00 – 16:00','Activo','18/04/2024']],
    footers:[{icon:'calendar',title:'Próximos eventos',detail:'Capacitación · 29 de octubre de 2026'},{icon:'database',title:'Gestión de nómina',detail:'Administra las nóminas del equipo'}]
  };
