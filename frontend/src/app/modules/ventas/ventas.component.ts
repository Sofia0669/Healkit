import { Component } from '@angular/core';
import { ModuleViewComponent } from '../../shared/components/module-view/module-view.component';
import { VENTAS_CONFIG } from './ventas.config';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [ModuleViewComponent],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css'
})
export class VentasComponent {
  readonly config = VENTAS_CONFIG;
}
