import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
} from '@ionic/angular/standalone';
import { BottomTabsComponent } from 'src/app/components/tabss/bottom-tabs.component';
import { itemsConfigType } from 'src/app/models/itemsConfig';
import { AuthService } from 'src/app/services/auth/auth.service';
import { map } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';

function toTwoWordsSafe(input: string | null | undefined): string {
  if (!input) return 'Usuário';

  const parts = input.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return 'Usuário';
  if (parts.length <= 2) return parts.join(' ');
  return `${parts[0]} ${parts[1]}`;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonIcon,
    RouterLink,
    BottomTabsComponent,
    AsyncPipe,
  ],
})
export class ProfilePage {
  itemsConfig: itemsConfigType[] = [
    { href: '/my-account', icon: 'person-circle-outline', text: 'Minha Conta' },
    {
      href: '/notifications',
      icon: 'notifications-outline',
      text: 'Notificações',
    },
    { href: '/security', icon: 'lock-closed-outline', text: 'Segurança' },
    {
      href: '/help-support',
      icon: 'help-circle-outline',
      text: 'Ajuda & Suporte',
    },
  ];

  name$ = this.auth.user$.pipe(
    map((u) => {
      if (u?.displayName && u.displayName.trim()) {
        return toTwoWordsSafe(u.displayName);
      }

      const local = (u?.email ?? '')
        .split('@')[0]
        .replace(/[._-]+/g, ' ') 
        .trim();

      return toTwoWordsSafe(local);
    })
  );

  email$ = this.auth.user$.pipe(map((u) => u?.email || '—'));

  constructor(private auth: AuthService, private router: Router) {}

  async logout() {
    await this.auth.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
