import { Component, OnInit } from '@angular/core';
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
    BottomTabsComponent,
    IonIcon,
    RouterLink,
  ],
})
export class ProfilePage implements OnInit {
  itemsConfig: itemsConfigType[] = [
    {
      href: '/my-account',
      icon: 'person-circle-outline',
      text: 'Minha Conta',
    },
    {
      href: '/notifications',
      icon: 'notifications-outline',
      text: 'Notificações',
    },
    {
      href: '/security',
      icon: 'lock-closed-outline',
      text: 'Segurança',
    },
    {
      href: '/help-support',
      icon: 'help-circle-outline',
      text: 'Ajuda & Suporte',
    },
  ];

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {}

  async logout() {
    await this.auth.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
