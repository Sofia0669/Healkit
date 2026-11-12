import { Component } from '@angular/core';
import { ModuleViewComponent } from '../../shared/components/module-view/module-view.component';
import { RRHH_CONFIG } from './recursos-humanos.config';

@Component({
  selector: 'app-recursos-humanos',
  standalone: true,
  imports: [ModuleViewComponent],
  templateUrl: './recursos-humanos.component.html',
  styleUrl: './recursos-humanos.component.css'
})
export class RecursosHumanosComponent {
  readonly config = RRHH_CONFIG;
}
