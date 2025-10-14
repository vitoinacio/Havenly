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
  FacebookAuthProvider,
  User,
  updateProfile,
  authState,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { UserService } from '../user/user';
import { fetchSignInMethodsForEmail } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private injector = inject(EnvironmentInjector);

  constructor(private auth: Auth, private userSvc: UserService) {}

  user$: Observable<User | null> = authState(this.auth);

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

    let methods: string[] = [];
    try {
      methods = await this.getSignInMethods(e);
    } catch (err: any) {
      if (err?.code === 'auth/invalid-email') {
        const ex: any = new Error('E-mail inválido.');
        ex.code = 'auth/invalid-email';
        throw ex;
      }
      throw err;
    }

    if (!methods || methods.length === 0) {
      const ex: any = new Error(
        'Não existe conta para este e-mail. Crie uma conta para continuar.'
      );
      ex.code = 'app/user-not-found';
      throw ex;
    }

    const hasPassword = methods.includes('password');
    const hasGoogle = methods.includes('google.com');
    const hasFacebook = methods.includes('facebook.com');

    if (!hasPassword) {
      const provs = [
        hasGoogle ? 'Google' : null,
        hasFacebook ? 'Facebook' : null,
      ]
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
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(this.auth, provider);
    await this.userSvc.ensureUserDoc(cred.user);
    return cred;
  }

  async loginWithFacebook() {
    const provider = new FacebookAuthProvider();
    const cred = await signInWithPopup(this.auth, provider);
    await this.userSvc.ensureUserDoc(cred.user);
    return cred;
  }

  async getSignInMethods(email: string): Promise<string[]> {
    try {
      return await runInInjectionContext(this.injector, () =>
        fetchSignInMethodsForEmail(this.auth, email.trim())
      );
    } catch (err) {
      return [];
    }
  }
}
