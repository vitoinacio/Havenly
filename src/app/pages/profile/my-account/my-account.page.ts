import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  EnvironmentInjector,
  runInInjectionContext,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonInput,
  IonButton,
  AlertController,
} from '@ionic/angular/standalone';

import { Router } from '@angular/router';

import { Auth, authState, updateProfile, User } from '@angular/fire/auth';

import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from '@angular/fire/firestore';

import { Subject, takeUntil } from 'rxjs';
import { AccountCleanupService } from 'src/app/services/account/account-cleanup';
import { ToastService } from 'src/app/services/toast/toast';

import {
  reload,
  verifyBeforeUpdateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { deleteField } from 'firebase/firestore';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.page.html',
  styleUrls: ['./my-account.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonInput,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class MyAccountPage implements OnInit, OnDestroy {
  name = '';
  email = '';
  phone = '';

  loading = false;
  ready = false;

  private user: User | null = null;
  private destroy$ = new Subject<void>();
  private injector = inject(EnvironmentInjector);

  constructor(
    private auth: Auth,
    private afs: Firestore,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private cleanup: AccountCleanupService,
    private alertCtrl: AlertController,
    private toast: ToastService
  ) {}

  ngOnInit() {
    runInInjectionContext(this.injector, () => authState(this.auth))
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (u) => {
        if (!u) {
          this.router.navigateByUrl('/login', { replaceUrl: true });
          return;
        }

        this.user = u;
        this.name = (u.displayName || '').trim();
        this.email = (u.email || '').trim();

        try {
          const ref = doc(this.afs, 'users', u.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data() as any;
            this.name = (data.name ?? this.name ?? '').trim();
            this.email = (data.email ?? this.email ?? '').trim();
            this.phone = (data.phone ?? '').trim();
          } else {
            this.phone = '';
          }
        } catch {
          this.phone = '';
        }

        this.ready = true;
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async handleReauthThen<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.user) throw new Error('Usuário não autenticado.');
    const hasPassword = this.user.providerData.some(
      (p) => p.providerId === 'password'
    );

    if (hasPassword) {
      const alert = await this.alertCtrl.create({
        header: 'Confirme sua identidade',
        inputs: [
          { name: 'password', type: 'password', placeholder: 'Sua senha' },
        ],
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          { text: 'Confirmar', role: 'confirm' },
        ],
      });
      await alert.present();
      const res = await alert.onDidDismiss();
      if (res.role !== 'confirm') throw new Error('Operação cancelada.');

      const pwd = (res.data?.values?.password || '').toString();
      if (!this.user.email || !pwd) throw new Error('Senha obrigatória.');
      const cred = EmailAuthProvider.credential(this.user.email, pwd);
      await reauthenticateWithCredential(this.user, cred);
      return fn();
    }

    this.toast.show(
      'Reautentique-se pelo provedor usado no login (Google/Facebook).',
      'warning'
    );
    throw Object.assign(new Error('requires-recent-login'), {
      code: 'auth/requires-recent-login',
    });
  }

  async save() {
    if (!this.user) return;

    const newName = (this.name || '').trim().slice(0, 120);
    const inputEmail = (this.email || '').trim();
    const newEmailNorm = inputEmail.toLowerCase();
    const prevEmailNorm = (this.user.email || '').trim().toLowerCase();
    const newPhone = (this.phone || '').trim();

    if (!newName || !newEmailNorm) {
      this.toast.show('Nome e e-mail são obrigatórios.', 'warning');
      return;
    }

    this.loading = true;
    try {
      if (newName !== (this.user.displayName || '')) {
        try {
          await updateProfile(this.user!, { displayName: newName });
        } catch (e: any) {
          if (e?.code === 'auth/requires-recent-login') {
            await this.handleReauthThen(() =>
              updateProfile(this.user!, { displayName: newName })
            );
          } else {
            throw e;
          }
        }
      }

      if (newEmailNorm !== prevEmailNorm) {
        try {
          await verifyBeforeUpdateEmail(this.user!, newEmailNorm);
          this.toast.show(
            'Enviamos um link para confirmar a troca de e-mail.',
            'success'
          );
        } catch (e: any) {
          if (e?.code === 'auth/requires-recent-login') {
            await this.handleReauthThen(() =>
              verifyBeforeUpdateEmail(this.user!, newEmailNorm)
            );
            this.toast.show(
              'Enviamos um link para confirmar a troca de e-mail.',
              'success'
            );
          } else if (e?.code === 'auth/invalid-email') {
            this.toast.show('E-mail inválido.', 'warning');
            throw e;
          } else if (e?.code === 'auth/email-already-in-use') {
            this.toast.show('Este e-mail já está em uso.', 'warning');
            throw e;
          } else {
            throw e;
          }
        }
      }

      const userRef = doc(this.afs, 'users', this.user.uid);
      const base = {
        name: newName,
        updatedAt: serverTimestamp(),
      } as any;

      if (newPhone) {
        base.phone = newPhone;
      } else {
        base.phone = deleteField();
      }

      if (newEmailNorm === prevEmailNorm) {
        base.email = newEmailNorm;
      } else {
        base.email = prevEmailNorm;
        base.pendingEmail = newEmailNorm;
      }
      await setDoc(userRef, base, { merge: true });

      await reload(this.user!);
      try {
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data() as any;
          this.name = (data.name ?? newName ?? '').trim();
          this.email = (
            data.pendingEmail ??
            data.email ??
            newEmailNorm ??
            ''
          ).trim();
          this.phone = (data.phone ?? newPhone ?? '').trim();
        } else {
          this.name = newName;
          this.email = newEmailNorm;
          this.phone = newPhone;
        }
      } catch {
        this.name = newName;
        this.email = newEmailNorm;
        this.phone = newPhone;
      }

      if (newEmailNorm === prevEmailNorm) {
        this.toast.show('Dados salvos!', 'success');
      }
    } catch (e: any) {
      this.toast.show(e?.message || 'Erro ao salvar.', 'danger');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async deleteAccount() {
    const confirmAlert = await this.alertCtrl.create({
      header: 'Excluir conta',
      message: 'Tem certeza? Isso apagará sua conta e TODOS os seus dados.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Excluir', role: 'destructive' },
      ],
    });
    await confirmAlert.present();
    const role = (await confirmAlert.onDidDismiss()).role;
    if (role !== 'destructive') return;

    const pwdAlert = await this.alertCtrl.create({
      header: 'Confirmação',
      message:
        'Se sua conta foi criada com e-mail/senha, digite a senha para confirmar. Se for Google/Facebook, deixe em branco.',
      inputs: [
        { name: 'password', type: 'password', placeholder: 'Senha (opcional)' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Continuar', role: 'confirm' },
      ],
    });
    await pwdAlert.present();
    const pwdData = await pwdAlert.onDidDismiss();
    if (pwdData.role !== 'confirm') return;
    const password: string | null =
      (pwdData.data?.values?.password ?? '').trim() || null;

    try {
      this.loading = true;

      await this.cleanup.deleteAllUserData({
        deleteStorage: false,
        askPassword: async () => password,
      });

      this.toast.show('Conta excluída com sucesso.', 'success');
      this.router.navigateByUrl('/login', { replaceUrl: true });
    } catch (e: any) {
      this.toast.show(
        e?.message || 'Não foi possível excluir a conta.',
        'danger'
      );
    } finally {
      this.loading = false;
    }
  }
}
