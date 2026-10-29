import {Component} from '@angular/core';
import {RouterLink,RouterOutlet,RouterLinkActive} from '@angular/router';
import {HkIconComponent} from '../hk-icon/hk-icon.component';
@Component({selector:'app-layout',standalone:true,imports:[RouterOutlet,RouterLink,RouterLinkActive,HkIconComponent],templateUrl:'./layout.component.html',styleUrl:'./layout.component.css'})
export class LayoutComponent {menuOpen=false; toggleMenu(){this.menuOpen=!this.menuOpen}}
