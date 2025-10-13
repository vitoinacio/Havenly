import { Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  imports: [
    IonButton,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonIcon,
  ],
  templateUrl: './upgrade-plan.page.html',
  styleUrls: ['./upgrade-plan.page.scss'],
  host: { class: 'ion-page' },
})
export class UpgradePlanPage {}
