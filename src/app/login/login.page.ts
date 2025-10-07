import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonContent, IonItem, IonLabel, IonInput, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { IonIcon } from '@ionic/angular/standalone';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
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
    IonIcon
  ]
})
export class LoginPage {
  email: string = '';
  password: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onLogin() {
    if (!this.email || !this.password) {
      alert('Preencha email e senha!');
      return;
    }

    this.loading = true;

    try {
      await this.authService.login(this.email, this.password);
      alert('Login realizado com sucesso!');
      this.router.navigate(['/home']); // ✅ redireciona para /home
    } catch (err: any) {
      console.error(err);
      alert('Erro ao fazer login: ' + err.message);
    } finally {
      this.loading = false;
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToReset() {
    this.router.navigate(['/reset']);
  }
}