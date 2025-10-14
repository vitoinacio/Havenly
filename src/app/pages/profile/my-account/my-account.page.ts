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

import {
  Auth,
  authState,
  updateProfile,
  updateEmail,
  User,
} from '@angular/fire/auth';

import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from '@angular/fire/firestore';

import { reload } from 'firebase/auth';
import { Subject, takeUntil } from 'rxjs';
import { AccountCleanupService } from 'src/app/services/account/account-cleanup';
import { ToastService } from 'src/app/services/toast/toast';

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
          const snap = await runInInjectionContext(this.injector, () =>
            getDoc(ref)
          );
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

  async save() {
    if (!this.user) return;

    const newName = (this.name || '').trim();
    const newEmail = (this.email || '').trim();
    const newPhone = (this.phone || '').trim();

    if (!newName || !newEmail) {
      this.toast.show('Nome e e-mail são obrigatórios.', 'warning');
      return;
    }

    this.loading = true;
    try {
      if (newName !== (this.user.displayName || '')) {
        await runInInjectionContext(this.injector, () =>
          updateProfile(this.user!, { displayName: newName })
        );
      }

      if (newEmail !== (this.user.email || '')) {
        await runInInjectionContext(this.injector, () =>
          updateEmail(this.user!, newEmail)
        );
      }

      const userRef = doc(this.afs, 'users', this.user.uid);
      await runInInjectionContext(this.injector, () =>
        setDoc(
          userRef,
          {
            name: newName,
            email: newEmail,
            phone: newPhone,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        )
      );

      await runInInjectionContext(this.injector, () => reload(this.user!));

      try {
        const snap = await runInInjectionContext(this.injector, () =>
          getDoc(userRef)
        );
        if (snap.exists()) {
          const data = snap.data() as any;
          this.name = (data.name ?? newName ?? '').trim();
          this.email = (data.email ?? newEmail ?? '').trim();
          this.phone = (data.phone ?? newPhone ?? '').trim();
        } else {
          this.name = newName;
          this.email = newEmail;
          this.phone = newPhone;
        }
      } catch {
        this.name = newName;
        this.email = newEmail;
        this.phone = newPhone;
      }

      this.toast.show('Dados salvos!', 'success');
    } catch (e: any) {
      if (e?.code === 'auth/requires-recent-login') {
        this.toast.show(
          'Por segurança, faça login novamente para alterar o e-mail.',
          'warning'
        );
        await this.auth.signOut();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      } else {
        this.toast.show(e?.message || 'Erro ao salvar.', 'danger');
      }
    } finally {
      this.loading = false;
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
