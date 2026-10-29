import { Component, Input } from '@angular/core';
import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
@Component({
    selector: 'hk-icon', standalone: true, imports: [NgSwitch, NgSwitchCase, NgSwitchDefault], template: `<svg class="hk-icon" viewBox="0 0 24 24" aria-hidden="true"><ng-container [ngSwitch]="name">
<ng-container *ngSwitchCase="'home'"><path d="m3 10 9-7 9 7v10h-6v-7H9v7H3z"/></ng-container>
<ng-container *ngSwitchCase="'box'"><path d="m3 7 9-4 9 4v10l-9 4-9-4zM3 7l9 5 9-5M12 12v9"/></ng-container>
<ng-container *ngSwitchCase="'cart'"><circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/><path d="M2 3h2l3 13h13l2-9H5"/></ng-container>
<ng-container *ngSwitchCase="'users'"><circle cx="9" cy="8" r="3"/><path d="M2 21v-3c0-5 14-5 14 0v3zM17 6a3 3 0 0 1 0 6M18 15c3 0 4 2 4 5"/></ng-container>
<ng-container *ngSwitchCase="'user'"><circle cx="12" cy="8" r="4"/><path d="M4 22v-3c0-7 16-7 16 0v3z"/></ng-container>
<ng-container *ngSwitchCase="'logout'"><path d="M10 3H4v18h6M14 7l5 5-5 5M7 12h12"/></ng-container>
<ng-container *ngSwitchCase="'search'"><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></ng-container>
<ng-container *ngSwitchCase="'bell'"><path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5zM10 21h4"/></ng-container>
<ng-container *ngSwitchCase="'menu'"><path d="M3 6h18M3 12h18M3 18h18"/></ng-container>
<ng-container *ngSwitchCase="'calendar'"><rect x="3" y="5" width="18" height="17" rx="2"/><path d="M7 2v6m10-6v6M3 11h18m-14 4h3m4 0h3"/></ng-container>
<ng-container *ngSwitchCase="'alert'"><path d="M12 3 2 21h20zM12 9v5m0 4v.1"/></ng-container>
<ng-container *ngSwitchCase="'ban'"><circle cx="12" cy="12" r="10"/><path d="m5 5 14 14"/></ng-container>
<ng-container *ngSwitchCase="'pill'"><rect x="7" y="1" width="10" height="22" rx="5" transform="rotate(45 12 12)"/><path d="m8.5 8.5 7 7"/></ng-container>
<ng-container *ngSwitchCase="'plus'"><path d="M12 4v16M4 12h16"/></ng-container>
<ng-container *ngSwitchCase="'eye'"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></ng-container>
<ng-container *ngSwitchCase="'edit'"><path d="m4 17-1 4 4-1L20 7l-4-4z"/></ng-container>
<ng-container *ngSwitchCase="'trash'"><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6m4-6v6"/></ng-container>
<ng-container *ngSwitchCase="'filter'"><path d="M3 4h18l-7 9v7l-4-2v-5z"/></ng-container>
<ng-container *ngSwitchCase="'lock'"><rect x="5" y="10" width="14" height="12" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></ng-container>
<ng-container *ngSwitchCase="'arrow'"><path d="M4 12h16m-6-6 6 6-6 6"/></ng-container>
<ng-container *ngSwitchCase="'target'">
    <circle cx="12" cy="12" r="9"/>
    <circle cx="12" cy="12" r="5"/>
    <circle cx="12" cy="12" r="1"/>
</ng-container>
<ng-container *ngSwitchDefault><circle cx="12" cy="12" r="9"/></ng-container>
</ng-container></svg>` , styles: [`:host{display:inline-flex;align-items:center;justify-content:center}`]
})
export class HkIconComponent { @Input() name = 'box' }
