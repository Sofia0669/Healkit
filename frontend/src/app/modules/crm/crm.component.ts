import { Component } from '@angular/core';
import { ModuleViewComponent } from '../../shared/components/module-view/module-view.component';
import { CRM_CONFIG } from './crm.config';

@Component({
  selector: 'app-crm',
  standalone: true,
  imports: [ModuleViewComponent],
  templateUrl: './crm.component.html',
  styleUrl: './crm.component.css'
})
export class CrmComponent {
  readonly config = CRM_CONFIG;
}
