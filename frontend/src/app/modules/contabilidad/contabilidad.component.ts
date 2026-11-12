import { Component } from '@angular/core';
import { ModuleViewComponent } from '../../shared/components/module-view/module-view.component';
import { CONTABILIDAD_CONFIG } from './contabilidad.config';

@Component({
  selector: 'app-contabilidad',
  standalone: true,
  imports: [ModuleViewComponent],
  templateUrl: './contabilidad.component.html',
  styleUrl: './contabilidad.component.css'
})
export class ContabilidadComponent {
  readonly config = CONTABILIDAD_CONFIG;
}
