import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { POWER_BI_EMBED_URL } from './power-bi.config';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  readonly configured = POWER_BI_EMBED_URL.trim().length > 0;
  readonly reportUrl: SafeResourceUrl | null;

  constructor(sanitizer: DomSanitizer) {
    // La URL se define en un archivo local controlado por desarrolladores;
    // nunca se recibe de una entrada de usuario.
    this.reportUrl = this.configured &&
      /^https:\/\/(app\.powerbi\.com|app\.fabric\.microsoft\.com)\//.test(POWER_BI_EMBED_URL)
        ? sanitizer.bypassSecurityTrustResourceUrl(POWER_BI_EMBED_URL)
        : null;
  }
}
