import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonToolbar, IonIcon, IonLabel } from '@ionic/angular/standalone';

export interface TabItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

@Component({
  selector: 'app-bottom-tabs',
  standalone: true,
  imports: [CommonModule, RouterLink, IonToolbar, IonIcon, IonLabel],
  template: `
    @if (show) {
    <div class="tabbar">
      <ion-toolbar>
        <div class="tabbar-inner">
          <a
            *ngFor="let t of tabs"
            class="tablink"
            [routerLink]="t.href"
            [class.active]="t.id === active"
          >
            <ion-icon [name]="t.icon"></ion-icon>
            <ion-label>{{ t.label }}</ion-label>
          </a>
        </div>
      </ion-toolbar>
    </div>
    }
  `,
  styles: [
    `
      :host {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10;
        display: block;
      }
      .tabbar {
        background: var(--ion-background-color, #fff);
        border-top: 1px solid rgba(0, 0, 0, 0.08);
        padding-bottom: max(env(safe-area-inset-bottom), 0px);
      }
      .tabbar-inner {
        display: flex;
        justify-content: space-around;
        align-items: center;
        height: 65px;
      }
      .tablink {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        text-decoration: none;
        opacity: 0.68;
        color: var(--ion-color-medium);
        transition: opacity 0.2s;
      }
      .tablink.active {
        opacity: 1;
        font-weight: 600;
        color: var(--ion-color-primary);
      }
      ion-icon {
        font-size: 22px;
      }
      ion-label {
        font-size: 12px;
      }
    `,
  ],
})
export class BottomTabsComponent {
  @Input() show = true;
  @Input() active: string | null = null;
  @Input() tabs: TabItem[] = [
    { id: 'home', label: 'Geral', icon: 'pie-chart', href: '/home' },
    {
      id: 'properties',
      label: 'Imóveis',
      icon: 'home',
      href: '/properties',
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: 'person-circle',
      href: '/profile',
    },
  ];
}
