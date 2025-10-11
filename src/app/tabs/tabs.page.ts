import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonIcon,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonRouterOutlet,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonTabBar,
    IonTabButton,
    IonTabs,
    RouterLink,
    IonRouterOutlet,
  ],
})
export class TabsPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
