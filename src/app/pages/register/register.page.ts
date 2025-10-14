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
import { ToastService } from 'src/app/services/toast/toast';

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
  full_name = '';
  email = '';
  password = '';
  confirm = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  private mapRegisterError(code?: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Este e-mail já está em uso. Faça login ou use outro e-mail.';
      case 'auth/invalid-email':
        return 'E-mail inválido.';
      case 'auth/weak-password':
        return 'Senha fraca. Use pelo menos 6 caracteres.';
      case 'auth/network-request-failed':
        return 'Falha de rede. Verifique sua conexão.';
      case 'auth/account-exists-with-different-credential':
        return 'Este e-mail já está vinculado a um provedor social. Use o botão do provedor.';
      default:
        return 'Não foi possível registrar. Tente novamente.';
    }
  }

  async onRegister() {
    if (this.loading) return;
    const name = this.full_name.trim();
    const email = this.email.trim();
    const pass = this.password;
    const conf = this.confirm;

    if (!name || !email || !pass || !conf) {
      this.toast.show('Preencha todos os campos!', 'warning');
      return;
    }
    if (pass !== conf) {
      this.toast.show('As senhas não coincidem!', 'warning');
      return;
    }
    if (pass.length < 6) {
      this.toast.show('Senha fraca. Use pelo menos 6 caracteres.', 'warning');
      return;
    }

    this.loading = true;
    try {
      await this.authService.register(email, pass, name);
      this.toast.show('Usuário registrado com sucesso!', 'success');
      this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (err: any) {
      console.error(err);
      const friendly = err?.friendly as string | undefined;
      this.toast.show(friendly || this.mapRegisterError(err?.code), 'danger');
    } finally {
      this.loading = false;
    }
  }

  goToLogin() {
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  async loginGoogle() {
    if (this.loading) return;
    this.loading = true;
    try {
      await this.authService.loginWithGoogle();
      this.toast.show('Conta criada/entrada com Google!', 'success');
      this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (err: any) {
      console.error(err);
      const code = err?.code as string | undefined;
      const msg =
        code === 'auth/popup-closed-by-user'
          ? 'Janela do Google foi fechada antes de concluir.'
          : code === 'auth/popup-blocked'
          ? 'Popup do Google foi bloqueado pelo navegador.'
          : 'Não foi possível usar o Google. Tente novamente.';
      this.toast.show(msg, 'danger');
    } finally {
      this.loading = false;
    }
  }

  async loginFacebook() {
    if (this.loading) return;
    this.loading = true;
    try {
      await this.authService.loginWithFacebook();
      this.toast.show('Conta criada/entrada com Facebook!', 'success');
      this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (err: any) {
      console.error(err);
      const code = err?.code as string | undefined;
      const msg =
        code === 'auth/popup-closed-by-user'
          ? 'Janela do Facebook foi fechada antes de concluir.'
          : code === 'auth/popup-blocked'
          ? 'Popup do Facebook foi bloqueado pelo navegador.'
          : 'Não foi possível usar o Facebook. Tente novamente.';
      this.toast.show(msg, 'danger');
    } finally {
      this.loading = false;
    }
  }
}
