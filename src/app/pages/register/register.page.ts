import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth/auth.service';

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
    IonButton,
    IonSpinner,
    IonIcon,
  ],
})
export class RegisterPage {
  full_name: string = '';
  email: string = '';
  password: string = '';
  confirm: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async onRegister() {
    if (!this.full_name || !this.email || !this.password || !this.confirm) {
      alert('Preencha todos os campos!');
      return;
    }

    if (this.password !== this.confirm) {
      alert('As senhas não coincidem!');
      return;
    }

    try {
      await this.authService.register(this.email, this.password);

      alert('Usuário registrado com sucesso!');
      this.router.navigate(['/login']);
    } catch (err: any) {
      console.error(err);
      alert('Erro ao registrar: ' + err.message);
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
