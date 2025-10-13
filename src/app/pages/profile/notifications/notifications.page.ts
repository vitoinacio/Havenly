import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonToggle,
  IonContent,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonToggle,
    IonBackButton,
    IonButtons,
    IonHeader,
    IonTitle,
    IonToolbar,
  ],
})
export class NotificationsPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
