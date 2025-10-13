import { Component, OnInit } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonButtons, IonInput, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
  standalone: true,
  imports: [IonButton, IonInput, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar]
})
export class ChangePasswordPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
