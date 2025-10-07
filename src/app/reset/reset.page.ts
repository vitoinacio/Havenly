import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonContent, IonItem, IonLabel, IonInput, IonButton } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';

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
    IonButton
  ]
})
export class ResetPage {
  email: string = '';

  constructor(private authService: AuthService) {}

  async sendReset() {
    try {
      await this.authService.resetPassword(this.email);
      alert('Email de recuperação enviado!');
    } catch (err: any) {
      alert('Erro ao enviar email: ' + err.message);
    }
  }

  retry() {
    this.sendReset();
  }
}