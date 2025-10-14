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
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.page.html',
  styleUrls: ['./reset.page.scss'],
  standalone: true,
  imports: [
    IonSpinner,
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
  ],
})
export class ResetPage {
  email = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  private mapResetError(code?: string): string {
    switch (code) {
      case 'auth/invalid-email':
        return 'E-mail inválido.';
      case 'auth/user-not-found':
        return 'Não encontramos uma conta com esse e-mail.';
      case 'auth/network-request-failed':
        return 'Falha de rede. Verifique sua conexão.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
      default:
        return 'Não foi possível enviar o e-mail de recuperação.';
    }
  }

  async onReset() {
    const email = this.email.trim();
    if (!email) {
      this.toast.show('Informe seu e-mail!', 'warning');
      return;
    }

    this.loading = true;
    try {
      await this.authService.resetPassword(email);
      this.toast.show('E-mail de recuperação enviado! Confira sua caixa de entrada.', 'success');
      this.router.navigate(['/login']);
    } catch (err: any) {
      console.error(err);
      this.toast.show(this.mapResetError(err?.code), 'danger');
    } finally {
      this.loading = false;
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
