import {
  Injectable,
  EnvironmentInjector,
  inject,
  runInInjectionContext,
} from '@angular/core';

import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithCredential,
  User,
  updateProfile,
  authState,
  fetchSignInMethodsForEmail,
} from '@angular/fire/auth';

import { Observable, firstValueFrom } from 'rxjs';
import { UserService } from '../user/user';
import { Capacitor } from '@capacitor/core';

import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private injector = inject(EnvironmentInjector);

  constructor(private auth: Auth, private userSvc: UserService) {
    try {
      (this.auth as any).useDeviceLanguage?.();
    } catch {}
  }

  user$: Observable<User | null> = authState(this.auth);

  userOnce() {
    return firstValueFrom(this.user$);
  }

  async register(email: string, password: string, displayName?: string) {
    const e = email.trim();
    const p = password;

    const cred = await createUserWithEmailAndPassword(this.auth, e, p);

    if (displayName?.trim()) {
      await updateProfile(cred.user, { displayName: displayName.trim() });
    }

    await this.userSvc.ensureUserDoc(cred.user);
    return cred;
  }

  async login(email: string, password: string) {
    const e = email.trim();
    const p = password;

    const methods = await this.safeGetSignInMethods(e);
    if (!methods || methods.length === 0) {
      const ex: any = new Error(
        'Não existe conta para este e-mail. Crie uma conta para continuar.'
      );
      ex.code = 'app/user-not-found';
      throw ex;
    }

    if (!methods.includes('password')) {
      const provs = [methods.includes('google.com') ? 'Google' : null]
        .filter(Boolean)
        .join(' ou ');
      const ex: any = new Error(
        provs
          ? `Esta conta foi criada com ${provs}. Use o botão do ${provs}.`
          : 'Esta conta usa um provedor diferente.'
      );
      ex.code = 'app/use-oauth-provider';
      ex.providers = methods;
      throw ex;
    }

    try {
      const cred = await signInWithEmailAndPassword(this.auth, e, p);
      await this.userSvc.ensureUserDoc(cred.user);
      return cred;
    } catch (err: any) {
      if (err?.code === 'auth/invalid-credential') {
        const ex: any = new Error('Senha incorreta.');
        ex.code = 'app/wrong-password';
        throw ex;
      }
      throw err;
    }
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email.trim());
  }

  logout() {
    return signOut(this.auth);
  }

  async loginWithGoogle() {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      const { credential } = await FirebaseAuthentication.signInWithGoogle();
      const idToken = credential?.idToken;
      if (!idToken) {
        const ex: any = new Error('Não foi possível obter o token do Google.');
        ex.code = 'auth/no-google-idtoken';
        throw ex;
      }
      const gCred = GoogleAuthProvider.credential(idToken);
      const res = await signInWithCredential(this.auth, gCred);
      await this.userSvc.ensureUserDoc(res.user);
      return res;
    } else {
      const provider = new GoogleAuthProvider();
      try {
        const res = await signInWithPopup(this.auth, provider);
        if (res?.user) {
          await this.userSvc.ensureUserDoc(res.user);
        }
        return res;
      } catch (error) {
        console.error('Erro no login com popup:', error);
        return null;
      }
    }
  }

  // A função handleRedirectResult não é mais necessária para o fluxo com popup.
  // Pode ser removida ou deixada em branco.
  async handleRedirectResult() {
    return null;
  }

  async getSignInMethods(email: string): Promise<string[]> {
    return runInInjectionContext(this.injector, () =>
      fetchSignInMethodsForEmail(this.auth, email.trim())
    );
  }

  private async safeGetSignInMethods(email: string): Promise<string[]> {
    try {
      return await this.getSignInMethods(email);
    } catch {
      return [];
    }
  }
}
