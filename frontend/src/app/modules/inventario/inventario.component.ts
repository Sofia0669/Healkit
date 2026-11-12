import { Component } from '@angular/core';
import { ModuleViewComponent } from '../../shared/components/module-view/module-view.component';
import { INVENTARIO_CONFIG } from './inventario.config';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [ModuleViewComponent],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent {
  readonly config = INVENTARIO_CONFIG;
}
