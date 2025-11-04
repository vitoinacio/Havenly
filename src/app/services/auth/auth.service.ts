import {
  Injectable,
  EnvironmentInjector,
  inject,
} from '@angular/core';

import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User,
  updateProfile,
  authState,
} from '@angular/fire/auth';

import { Observable, firstValueFrom } from 'rxjs';
import { UserService } from '../user/user';

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

    try {
      const cred = await signInWithEmailAndPassword(this.auth, e, p);
      await this.userSvc.ensureUserDoc(cred.user);
      return cred;
    } catch (err: any) {
      switch (err?.code) {
        case 'auth/user-not-found':
          throw Object.assign(new Error('Não existe conta para este e-mail.'), {
            code: 'app/user-not-found',
          });
        case 'auth/invalid-login-credentials':
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
          throw Object.assign(new Error('Senha incorreta.'), {
            code: 'app/wrong-password',
          });
        default:
          throw err;
      }
    }
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email.trim());
  }

  logout() {
    return signOut(this.auth);
  }
}
