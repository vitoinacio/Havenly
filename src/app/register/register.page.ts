import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonContent, IonItem, IonLabel, IonInput, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton
  ]
})
export class RegisterPage {
  // propriedades ligadas ao formulário
  full_name: string = '';
  email: string = '';
  password: string = '';
  confirm: string = '';

  constructor(private router: Router) {}

  // chamado no (ngSubmit)
  onRegister() {
    if (this.password !== this.confirm) {
      console.log('As senhas não coincidem!');
      return;
    }

    console.log('Registrando usuário:', {
      full_name: this.full_name,
      email: this.email,
      password: this.password
    });

    // aqui você chamaria seu serviço de autenticação futuramente
    // por enquanto só redireciona para login
    this.router.navigate(['/login']);
  }

  // chamado no link "Já tem conta? Fazer Login"
  goToLogin() {
    this.router.navigate(['/login']);
  }
}