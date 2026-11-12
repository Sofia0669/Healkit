import { Component } from '@angular/core';
import { ModuleViewComponent } from '../../shared/components/module-view/module-view.component';
import { PROVEEDORES_CONFIG } from './proveedores.config';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [ModuleViewComponent],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.css'
})
export class ProveedoresComponent {
  readonly config = PROVEEDORES_CONFIG;
}
