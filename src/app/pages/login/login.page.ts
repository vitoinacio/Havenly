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
  ],
})
export class LoginPage {
  email = '';
  password = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  private mapAuthError(code?: string): string {
    switch (code) {
      case 'auth/invalid-email':
        return 'E-mail inválido.';
      case 'auth/user-disabled':
        return 'Esta conta foi desativada.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
      case 'auth/network-request-failed':
        return 'Falha de rede. Verifique sua conexão.';
      default:
        return 'Não foi possível autenticar. Tente novamente.';
    }
  }

  async onLogin() {
    if (this.loading) return;

    const email = this.email.trim();
    const password = this.password;

    if (!email || !password) {
      this.toast.warning('Preencha e-mail e senha!');
      return;
    }

    this.loading = true;
    try {
      await this.authService.login(email, password);
    } catch (err: any) {
      switch (err?.code) {
        case 'app/user-not-found':
          this.toast.show('Conta não encontrada.', 'warning', 3000, [
            {
              text: 'Criar conta',
              handler: () =>
                this.router.navigate(['/register'], { queryParams: { email } }),
            },
            { text: 'Fechar', role: 'cancel' },
          ]);
          break;
        case 'app/use-oauth-provider':
          this.toast.warning(
            err?.message ||
              'Use o provedor social configurado para esse e-mail.'
          );
          break;
        case 'app/wrong-password':
          this.toast.error('Senha incorreta.');
          break;
        case 'auth/invalid-email':
          this.toast.warning('E-mail inválido.');
          break;
        default:
          this.toast.error(this.mapAuthError(err?.code));
      }
    } finally {
      this.loading = false;
    }
  }

  goToRegister() {
    this.router.navigate(['/register'], {
      queryParams: { email: this.email.trim() },
    });
  }

  goToReset() {
    this.router.navigate(['/reset'], {
      queryParams: { email: this.email.trim() },
    });
  }

  private mapPopupError(code?: string): string {
    switch (code) {
      case 'auth/popup-closed-by-user':
        return 'Janela fechada antes de concluir.';
      case 'auth/cancelled-popup-request':
        return 'Outra janela de login já está aberta.';
      case 'auth/popup-blocked':
        return 'Popup bloqueado pelo navegador.';
      default:
        return 'Não foi possível autenticar com o Google. Tente novamente.';
    }
  }

  async loginGoogle(): Promise<void> {
    if (this.loading) return;
    this.loading = true;
    try {

      const result = await this.authService.loginWithGoogle();

      if (result?.user) {
        this.toast.success('Login com Google concluído!');
      }
    } catch (err: any) {
      this.toast.error(this.mapPopupError(err?.code));
    } finally {
      this.loading = false;
    }
  }
}
