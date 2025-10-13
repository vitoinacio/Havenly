import { Component, OnInit } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonButtons, IonInput, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-two-mfa',
  templateUrl: './two-mfa.page.html',
  styleUrls: ['./two-mfa.page.scss'],
  standalone: true,
  imports: [IonButton, IonInput, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar,]
})
export class TwoMFAPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
