import { Injectable } from '@angular/core';
import { ToastController, ToastButton } from '@ionic/angular';
import { ToastColor } from 'src/app/models/toast';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private current?: HTMLIonToastElement | null;

  constructor(private toastCtrl: ToastController) {}

  async show(
    message: string,
    color: ToastColor = 'medium',
    duration = 2500,
    buttons: ToastButton[] = []
  ) {
    if (this.current) {
      try {
        await this.current.dismiss();
      } catch {}
      this.current = null;
    }

    const toast = await this.toastCtrl.create({
      message,
      duration,
      color,
      position: 'bottom',
      mode: 'md',
      translucent: false,
      cssClass: ['toast-up-150', `toast-${color}`],
      buttons: buttons.length ? buttons : [{ icon: 'close', role: 'cancel' }],
    });

    this.current = toast;
    await toast.present();

    toast.onDidDismiss().then(() => {
      if (this.current === toast) this.current = null;
    });
  }

  success(msg: string, ms = 2500) {
    return this.show(msg, 'success', ms);
  }
  warning(msg: string, ms = 2500) {
    return this.show(msg, 'warning', ms);
  }
  error(msg: string, ms = 3000) {
    return this.show(msg, 'danger', ms);
  }
}
