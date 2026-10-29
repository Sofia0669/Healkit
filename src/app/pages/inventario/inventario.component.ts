import {Component,computed,signal} from '@angular/core';import {FormsModule} from '@angular/forms';import {HkIconComponent} from '../../shared/hk-icon/hk-icon.component';
type Product={code:string;name:string;category:string;presentation:string;stock:number;minStock:number;expiry:string};
const START:Product[]=[{code:'MED001',name:'Paracetamol 500 mg',category:'Analgésicos',presentation:'Caja x 20',stock:120,minStock:20,expiry:'2028-08-15'},{code:'MED002',name:'Amoxicilina 500 mg',category:'Antibióticos',presentation:'Caja x 21',stock:15,minStock:20,expiry:'2026-02-10'},{code:'MED003',name:'Ibuprofeno 400 mg',category:'Analgésicos',presentation:'Caja x 20',stock:0,minStock:15,expiry:'2026-01-05'},{code:'MED004',name:'Omeprazol 20 mg',category:'Gastrointestinal',presentation:'Caja x 14',stock:80,minStock:10,expiry:'2028-11-22'},{code:'MED005',name:'Loratadina 10 mg',category:'Antihistamínicos',presentation:'Caja x 10',stock:5,minStock:20,expiry:'2026-03-18'}];
@Component({selector:'app-inventory',standalone:true,imports:[FormsModule,HkIconComponent],templateUrl:'./inventario.component.html',styleUrl:'./inventario.component.css'})export class InventoryComponent{
 products=signal<Product[]>(START); search=''; filter='Todos'; modal=false; editCode:string|null=null; draft:Product=this.blank();
 get visible(){return this.products().filter(p=>(p.name+' '+p.code+' '+p.category).toLowerCase().includes(this.search.toLowerCase())&&(this.filter==='Todos'||this.status(p)===this.filter));}
 status(p:Product){if(p.expiry<'2026-10-24')return 'Vencido';if(p.stock<=p.minStock)return 'Stock bajo';return 'Disponible'}
 style(p:Product){const s=this.status(p);return s==='Disponible'?'success':s==='Vencido'?'danger':'warn'}
 date(p:Product){const [y,m,d]=p.expiry.split('-');return `${d}/${m}/${y}`}
 blank():Product{return {code:'',name:'',category:'',presentation:'',stock:0,minStock:10,expiry:'2028-01-01'}}
 create(){this.editCode=null;this.draft=this.blank();this.modal=true}
 edit(p:Product){this.editCode=p.code;this.draft={...p};this.modal=true}
 view(p:Product){alert(`${p.name} (${p.code})\nStock: ${p.stock}\nVencimiento: ${this.date(p)}`)}
 remove(p:Product){if(confirm(`¿Eliminar ${p.name} del prototipo?`))this.products.update(items=>items.filter(x=>x.code!==p.code))}
 save(){if(!this.draft.code.trim()||!this.draft.name.trim())return;if(this.editCode){this.products.update(items=>items.map(x=>x.code===this.editCode?{...this.draft}:x))}else{this.products.update(items=>[...items,{...this.draft}])}this.modal=false}
}