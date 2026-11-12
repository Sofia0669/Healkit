import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HkIconComponent } from '../../shared/icons/hk-icon.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, HkIconComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {}
