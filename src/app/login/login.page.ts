import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Login } from '../services/auth/login';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner,
    RouterLink
  ],
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';

  constructor(private loginService: Login) {}

  ngOnInit() {}

  async onLogin() {
    console.log('Email digitado:', this.email);
    console.log('Senha digitada:', this.password);
    try {
      await this.loginService.login(this.email, this.password);
    } catch (error) {
      // Lógica de erro
    }
  }
}
