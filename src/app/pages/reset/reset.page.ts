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

  private isEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  private mapResetError(code?: string): string {
    switch (code) {
      case 'auth/invalid-email':
        return 'E-mail inválido.';
      case 'auth/network-request-failed':
        return 'Falha de rede. Verifique sua conexão.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
      default:
        return 'Não foi possível enviar o e-mail de recuperação.';
    }
  }

  async onReset(): Promise<void> {
    if (this.loading) return;

    const email = this.email.toLowerCase().trim();
    if (!email || !this.isEmail(email)) {
      this.toast.show('Informe um e-mail válido!', 'warning');
      return;
    }

    this.loading = true;
    try {
      await this.authService.resetPassword(email);
    } catch (err: any) {
    } finally {
      this.loading = false;
    }

    this.toast.show(
      'Se existir uma conta para esse e-mail, enviamos instruções de recuperação.',
      'success',
      5000
    );
    this.router.navigate(['/login']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
