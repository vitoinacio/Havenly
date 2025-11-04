import { Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonInput,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Auth } from '@angular/fire/auth';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';

import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-change-password',
  standalone: true,
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonInput,
    IonButtons,
    IonBackButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonIcon,
  ],
})
export class ChangePasswordPage {
  form = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  // estado UI
  loading = false;
  show = {
    current: false,
    next: false,
    confirm: false,
  };

  // mensagens de erro
  error = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    general: '',
  };

  constructor(private auth: Auth, private toastCtrl: ToastController) {}

  private clearErrors() {
    this.error = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      general: '',
    };
  }

  private validate(): boolean {
    this.clearErrors();

    if (!this.form.currentPassword?.trim()) {
      this.error.currentPassword = 'Informe a senha atual.';
    }
    if (!this.form.newPassword || this.form.newPassword.length < 6) {
      this.error.newPassword =
        'A nova senha precisa ter ao menos 6 caracteres.';
    }
    if (this.form.confirmPassword !== this.form.newPassword) {
      this.error.confirmPassword =
        'A confirmação não confere com a nova senha.';
    }

    return !(
      this.error.currentPassword ||
      this.error.newPassword ||
      this.error.confirmPassword
    );
  }

  get submitDisabled() {
    return (
      this.loading ||
      !this.form.currentPassword ||
      !this.form.newPassword ||
      !this.form.confirmPassword ||
      this.form.newPassword.length < 6 ||
      this.form.newPassword !== this.form.confirmPassword
    );
  }

  async onSubmit() {
    if (!this.validate()) return;

    const user = this.auth.currentUser;
    if (!user) {
      this.error.general =
        'Você precisa estar autenticado para alterar a senha.';
      return;
    }
    if (!user.email) {
      this.error.general =
        'Esta conta não possui e-mail/senha. Faça login por e-mail e senha para alterar.';
      return;
    }

    this.loading = true;
    this.error.general = '';

    try {
      // 1) Reautenticar com a senha atual
      const cred = EmailAuthProvider.credential(
        user.email,
        this.form.currentPassword
      );
      await reauthenticateWithCredential(user, cred);

      // 2) Atualizar a senha
      await updatePassword(user, this.form.newPassword);

      // 3) Feedback e reset
      await this.showToast('Senha alterada com sucesso!', 'success');
      this.form = { currentPassword: '', newPassword: '', confirmPassword: '' };
    } catch (err: any) {
      const code = err?.code || '';
      if (
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-credential'
      ) {
        this.error.currentPassword = 'Senha atual incorreta.';
      } else if (code === 'auth/too-many-requests') {
        this.error.general =
          'Muitas tentativas. Tente novamente em alguns minutos.';
      } else if (code === 'auth/weak-password') {
        this.error.newPassword = 'Senha fraca. Use 6+ caracteres.';
      } else if (code === 'auth/requires-recent-login') {
        this.error.general =
          'Por segurança, faça login novamente e repita a alteração.';
      } else {
        this.error.general =
          'Não foi possível alterar a senha. Tente novamente.';
        console.error('change-password error:', err);
      }
    } finally {
      this.loading = false;
    }
  }

  toggle(field: 'current' | 'next' | 'confirm') {
    this.show[field] = !this.show[field];
  }

  private async showToast(
    message: string,
    color: 'success' | 'warning' | 'danger' = 'success'
  ) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2200,
      cssClass: `toast-up-150 toast-${color}`,
    });
    await toast.present();
  }
}
