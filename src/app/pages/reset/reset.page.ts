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
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth/auth.service';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.page.html',
  styleUrls: ['./reset.page.scss'],
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
    IonicModule,
  ],
})
export class ResetPage {
  email: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async onReset() {
    if (!this.email) {
      alert('Informe seu email!');
      return;
    }

    try {
      await this.authService.resetPassword(this.email);
      alert('Email de recuperação enviado!');
      this.router.navigate(['/login']);
    } catch (err: any) {
      console.error(err);
      alert('Erro ao enviar email: ' + err.message);
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
