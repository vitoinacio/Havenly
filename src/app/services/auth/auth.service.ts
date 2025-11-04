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

  async loginWithGoogle() {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      const { credential } = await FirebaseAuthentication.signInWithGoogle({
        skipNativeAuth: true,
        scopes: ['profile', 'email'],
      });

      const idToken = credential?.idToken;
      const accessToken = credential?.accessToken;

      if (!idToken && !accessToken) {
        const ex: any = new Error('Não foi possível obter o token do Google.');
        ex.code = 'auth/no-google-idtoken';
        throw ex;
      }

      const gCred = GoogleAuthProvider.credential(
        idToken || null,
        accessToken || null
      );
      const res = await signInWithCredential(this.auth, gCred);

      try {
        await this.userSvc.ensureUserDoc(res.user);
      } catch (fireErr) {
        console.error(
          'Falha ao criar/atualizar userDoc no Firestore:',
          fireErr
        );
        throw fireErr;
      }
      return res;
    } else {
      const provider = new GoogleAuthProvider();
      try {
        const res = await signInWithPopup(this.auth, provider);
        if (res?.user) {
          try {
            await this.userSvc.ensureUserDoc(res.user);
          } catch (fireErr) {
            console.error(
              'Falha ao criar/atualizar userDoc no Firestore:',
              fireErr
            );
            throw fireErr;
          }
        }
        return res;
      } catch (popupErr: any) {
        if (
          typeof popupErr?.code === 'string' &&
          popupErr.code.startsWith('auth/')
        ) {
          console.error('Falha no signInWithPopup:', popupErr);
        } else {
          console.error('Falha pós-login (Firestore):', popupErr);
        }
        throw popupErr;
      }
    }
  }

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
