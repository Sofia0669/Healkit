import { Component, Input } from '@angular/core';

/** All icons have the same 24 x 24 viewBox, line weight and color. */
@Component({
  selector: 'hk-icon',
  standalone: true,
  template: `
  <svg class="hk-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"
       aria-hidden="true">
    @switch (name) {
      @case ('home') { <path d="m3 10 9-7 9 7v11h-6v-7H9v7H3z"/> }
      @case ('package') { <path d="m3 7 9-4 9 4v10l-9 4-9-4zM3 7l9 5 9-5M12 12v9"/> }
      @case ('cart') { <circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/><path d="M2 3h2l3 13h13l2-9H5"/> }
      @case ('truck') { <path d="M2 5h12v12H2zM14 9h4l4 4v4h-8z"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/> }
      @case ('users') { <circle cx="9" cy="8" r="3"/><path d="M2 21v-3c0-5 14-5 14 0v3zM17 6a3 3 0 0 1 0 6M18 15c3 0 4 2 4 5"/> }
      @case ('database') { <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 4 18 4 18 0V5M3 12c0 4 18 4 18 0"/> }
      @case ('briefcase') { <rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V4h8v3M3 13h18"/> }
      @case ('user') { <circle cx="12" cy="8" r="4"/><path d="M4 22v-3c0-7 16-7 16 0v3z"/> }
      @case ('user-plus') { <circle cx="9" cy="8" r="3"/><path d="M2 21v-3c0-5 14-5 14 0v3M19 7v8m-4-4h8"/> }
      @case ('logout') { <path d="M10 3H4v18h6M14 7l5 5-5 5M7 12h12"/> }
      @case ('search') { <circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/> }
      @case ('bell') { <path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5zM10 21h4"/> }
      @case ('menu') { <path d="M3 6h18M3 12h18M3 18h18"/> }
      @case ('calendar') { <rect x="3" y="5" width="18" height="17" rx="2"/><path d="M7 2v6m10-6v6M3 11h18"/> }
      @case ('alert') { <path d="M12 3 2 21h20zM12 9v5m0 4v.1"/> }
      @case ('ban') { <circle cx="12" cy="12" r="10"/><path d="m5 5 14 14"/> }
      @case ('pill') { <rect x="7" y="1" width="10" height="22" rx="5" transform="rotate(45 12 12)"/><path d="m8.5 8.5 7 7"/> }
      @case ('plus') { <path d="M12 4v16M4 12h16"/> }
      @case ('eye') { <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/> }
      @case ('edit') { <path d="m4 17-1 4 4-1L20 7l-4-4z"/> }
      @case ('filter') { <path d="M3 4h18l-7 9v7l-4-2v-5z"/> }
      @case ('lock') { <rect x="5" y="10" width="14" height="12" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/> }
      @case ('receipt') { <path d="M5 2h14v20l-3-2-4 2-4-2-3 2zM9 8h6M9 12h6"/> }
      @case ('coins') { <ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/> }
      @case ('award') { <circle cx="12" cy="9" r="6"/><path d="m8 14-2 8 6-3 6 3-2-8"/> }
      @case ('store') { <path d="M3 10h18l-2-7H5zM5 10v11h14V10M9 21v-7h6v7"/> }
      @case ('target') { <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/> }
      @case ('heart') { <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.2a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/> }
      @case ('chart') { <path d="M3 21h18M5 18v-6h3v6M11 18V5h3v13M17 18V9h3v9"/> }
      @case ('trend-down') { <path d="m3 6 7 7 4-4 7 7m-5 0h5v-5"/> }
      @case ('sun') { <circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/> }
      @default { <circle cx="12" cy="12" r="9"/> }
    }
  </svg>`,
  styles: [':host{display:inline-flex;vertical-align:middle}.hk-icon{width:24px;height:24px;display:block}']
})
export class HkIconComponent { @Input() name = 'package'; }
