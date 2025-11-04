import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonInput,
  IonButton,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Auth } from '@angular/fire/auth';
// 👇 use da SDK web:
import {
  multiFactor,
  TotpMultiFactorGenerator,
  TotpSecret,
} from 'firebase/auth';

import { ToastController } from '@ionic/angular';
import QRCode from 'qrcode';

@Component({
  selector: 'app-two-mfa',
  templateUrl: './two-mfa.page.html',
  styleUrls: ['./two-mfa.page.scss'],
  standalone: true,
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
  ],
})
export class TwoMFAPage implements OnInit, OnDestroy {
  code = '';
  loading = false;
  error = '';
  success = '';

  // TOTP
  secret: TotpSecret | null = null;
  qrDataUrl: string | null = null;
  secretKey: string | null = null;

  private destroyed = false;

  constructor(private auth: Auth, private toastCtrl: ToastController) {}

  async ngOnInit() {
    await this.startEnrollment();
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  private async startEnrollment() {
    this.loading = true;
    this.error = '';
    this.success = '';
    this.qrDataUrl = null;
    this.secretKey = null;
    this.secret = null;

    try {
      const user = this.auth.currentUser;
      if (!user) {
        this.error = 'Você precisa estar autenticado.';
        return;
      }

      // sessão de MFA
      const session = await multiFactor(user).getSession();

      // gerar segredo TOTP
      const secret = await TotpMultiFactorGenerator.generateSecret(session);

      // URL otpauth:// (para QR)
      const email = user.email || 'usuario@exemplo.com';
      const issuer = 'Seu App';
      const totpUri = secret.generateQrCodeUrl(email, issuer);

      // gerar DataURL do QR
      const dataUrl = await QRCode.toDataURL(totpUri);

      this.secret = secret;
      this.qrDataUrl = dataUrl;
      this.secretKey = secret.secretKey; // fallback manual no app de autenticação
    } catch (err: any) {
      if (err?.code === 'auth/requires-recent-login') {
        this.error =
          'Por segurança, faça login novamente e volte a esta tela para ativar o 2FA.';
      } else if (err?.code === 'auth/operation-not-allowed') {
        this.error =
          'TOTP não habilitado no projeto Firebase. Ative o 2FA (TOTP) no Console.';
      } else {
        this.error = 'Não foi possível iniciar a ativação do 2FA.';
        console.error('startEnrollment error:', err);
      }
    } finally {
      if (!this.destroyed) this.loading = false;
    }
  }

  async onSubmit() {
    this.error = '';
    this.success = '';
    if (!this.secret) {
      this.error = 'Gere o QR novamente e tente de novo.';
      return;
    }
    if (!this.code || this.code.replace(/\D/g, '').length !== 6) {
      this.error = 'Digite o código de 6 dígitos.';
      return;
    }

    this.loading = true;
    try {
      const user = this.auth.currentUser;
      if (!user) {
        this.error = 'Você precisa estar autenticado.';
        return;
      }

      const assertion = TotpMultiFactorGenerator.assertionForEnrollment(
        this.secret,
        this.code.replace(/\D/g, '')
      );
      await multiFactor(user).enroll(assertion, 'Authenticator');

      this.success = '2FA ativado com sucesso!';
      this.code = '';
      await this.toast('2FA ativado com sucesso!', 'success');
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/invalid-verification-code') {
        this.error =
          'Código inválido. Verifique os 6 dígitos e tente novamente.';
      } else if (code === 'auth/requires-recent-login') {
        this.error = 'Por segurança, faça login novamente e repita a ativação.';
      } else {
        this.error = 'Não foi possível ativar o 2FA.';
        console.error('enroll TOTP error:', err);
      }
    } finally {
      if (!this.destroyed) this.loading = false;
    }
  }

  async regenerate() {
    await this.startEnrollment();
  }

  private async toast(
    message: string,
    color: 'success' | 'warning' | 'danger' = 'success'
  ) {
    const t = await this.toastCtrl.create({
      message,
      duration: 2200,
      cssClass: `toast-up-150 toast-${color}`,
    });
    await t.present();
  }
}
