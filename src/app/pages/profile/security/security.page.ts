import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonButtons, IonButton, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-security',
  templateUrl: './security.page.html',
  styleUrls: ['./security.page.scss'],
  standalone: true,
  imports: [IonIcon, IonButton, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, RouterLink]
})
export class SecurityPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
