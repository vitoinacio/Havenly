import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonContent, IonItem, IonLabel, IonInput, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.page.html',
  styleUrls: ['./reset.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonContent, IonItem, IonLabel, IonInput, IonButton]
})
export class ResetPage {
  email: string = '';

  constructor() {}

  sendReset() {
    console.log('Enviando email de recuperação para:', this.email);
    // aqui você chamaria seu serviço de autenticação futuramente
  }

  retry() {
    console.log('Tentando novamente enviar email de recuperação...');
  }
}