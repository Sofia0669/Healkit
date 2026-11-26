import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HkIconComponent} from '../../icons/hk-icon.component';
import { ModuleConfig } from '../../models/module-config';

@Component({
  selector: 'app-module-view',
  standalone: true,
  imports: [CommonModule, FormsModule, HkIconComponent],
  templateUrl: './module-view.component.html'
})
export class ModuleViewComponent implements OnChanges {
  @Input({required: true}) config!: ModuleConfig;
  rows: string[][] = [];
  query = '';
  filtro = 'Todos';
  mostrarFiltro = false;
  modal = false;
  editingIndex: number | null = null;
  formulario: string[] = [];
  aviso = '';
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.config) {
      this.rows = this.config.rows.map(row => [...row]);
      this.query = '';
      this.filtro = 'Todos';
      this.aviso = '';
    }
  }
  get rowsFiltradas(): {row:string[]; index:number}[] {
    return this.rows.map((row,index)=>({row,index})).filter(({row}) =>
      row.some(c => c.toLowerCase().includes(this.query.trim().toLowerCase())) &&
      (this.filtro==='Todos' || row[this.config.statusIndex ?? -1]===this.filtro)
    );
  }
  get estados(): string[] {
    if(this.config.statusIndex===undefined) return [];
    return [...new Set(this.rows.map(row=>row[this.config.statusIndex!] ))];
  }
  claseEstado(value: string): string {
    if(['Disponible','Recibida','Frecuente','Activo','Ingreso'].includes(value)) return 'status-teal';
    return 'status-blue';
  }
  abrirNuevo(): void {
    this.editingIndex = null;
    this.formulario = this.config.columns.map(()=> '');
    this.modal = true;
  }
  editar(index:number): void {
    this.editingIndex=index;
    this.formulario=[...this.rows[index]];
    this.modal=true;
  }
  ver(row:string[]): void {
    this.aviso = row.map((item,i)=>`${this.config.columns[i]}: ${item}`).join(' · ');
  }
  guardar(): void {
    if(!this.formulario[0]?.trim()) {this.aviso='Completa el primer campo para continuar.'; return;}
    if(this.editingIndex===null) this.rows=[...this.rows,[...this.formulario]];
    else this.rows=this.rows.map((row,i)=>i===this.editingIndex?[...this.formulario]:row);
    this.modal=false;
    this.aviso='Cambios guardados solamente en esta demostración.';
  }
  get totalVenta(): number {
    if(this.config.key !== 'ventas') return 0;
    return this.rows.reduce((s,r)=>s+(Number((r[4]||'').replace(/[^\d]/g,''))||0),0);
  }
  get iva(): number { return Math.round(this.totalVenta*0.13); }
  dinero(v:number): string { return '₡'+new Intl.NumberFormat('es-CR').format(v); }
}
