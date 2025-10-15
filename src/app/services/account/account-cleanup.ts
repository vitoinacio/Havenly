import {
  Injectable,
  Optional,
  EnvironmentInjector,
  runInInjectionContext,
} from '@angular/core';

import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

import { Auth, User, deleteUser } from '@angular/fire/auth';

import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  writeBatch,
  limit,
  CollectionReference,
  DocumentReference,
} from '@angular/fire/firestore';

import {
  Storage,
  ref as storageRef,
  listAll,
  deleteObject,
  StorageReference,
} from '@angular/fire/storage';

import {
  AuthProvider,
  EmailAuthProvider,
  GoogleAuthProvider,
  FacebookAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
} from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class AccountCleanupService {
  constructor(
    private afs: Firestore,
    private auth: Auth,
    private injector: EnvironmentInjector,
    @Optional() private storage?: Storage
  ) {}

  private async reauthenticate(
    user: User,
    askPassword?: () => Promise<string | null>
  ) {
    const providers = user.providerData.map((p) => p.providerId);
    const isNative = Capacitor.isNativePlatform();

    if (providers.includes('password')) {
      if (!user.email || !askPassword) {
        throw new Error(
          'Reautenticação necessária. Forneça a senha do usuário.'
        );
      }
      const pwd = await askPassword();
      if (!pwd) throw new Error('Operação cancelada.');
      const cred = EmailAuthProvider.credential(user.email, pwd);
      await reauthenticateWithCredential(user, cred);
      return;
    }

    if (providers.includes('google.com')) {
      if (isNative) {
        const { credential } = await FirebaseAuthentication.signInWithGoogle();
        const idToken = credential?.idToken;
        if (!idToken)
          throw new Error('Não foi possível obter token do Google.');
        const cred = GoogleAuthProvider.credential(idToken);
        await reauthenticateWithCredential(user, cred);
      } else {
        await reauthenticateWithPopup(
          user,
          new GoogleAuthProvider() as AuthProvider
        );
      }
      return;
    }

    if (providers.includes('facebook.com')) {
      if (isNative) {
        const { credential } =
          await FirebaseAuthentication.signInWithFacebook();
        const accessToken = credential?.accessToken;
        if (!accessToken)
          throw new Error('Não foi possível obter token do Facebook.');
        const cred = FacebookAuthProvider.credential(accessToken);
        await reauthenticateWithCredential(user, cred);
      } else {
        await reauthenticateWithPopup(
          user,
          new FacebookAuthProvider() as AuthProvider
        );
      }
      return;
    }

    throw new Error(
      'Reautenticação necessária. Entre novamente e repita a exclusão.'
    );
  }

  private async deleteSubcollectionBatch(
    parentRef: DocumentReference,
    subPath: string,
    chunkSize = 400
  ) {
    const subCol = collection(parentRef, subPath) as CollectionReference;

    while (true) {
      const snap = await runInInjectionContext(this.injector, () =>
        getDocs(query(subCol, limit(chunkSize)))
      );
      if (snap.empty) break;

      const batch = writeBatch(this.afs);
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  }

  private async deleteStorageFolderRecursive(prefix: string) {
    if (!this.storage) return;
    const rootRef = storageRef(this.storage, prefix);
    await this.deleteStorageNode(rootRef);
  }

  private async deleteStorageNode(node: StorageReference): Promise<void> {
    const res = await runInInjectionContext(this.injector, () => listAll(node));

    await Promise.all(
      res.items.map((item) =>
        runInInjectionContext(this.injector, () => deleteObject(item)).catch(
          () => null
        )
      )
    );

    for (const dir of res.prefixes) {
      await this.deleteStorageNode(dir);
    }
  }

  async deleteAllUserData(
    options: {
      askPassword?: () => Promise<string | null>;
      deleteStorage?: boolean;
    } = {}
  ) {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado.');

    await this.reauthenticate(user, options.askPassword);

    const uid = user.uid;

    const propsQ = query(
      collection(this.afs, 'properties'),
      where('ownerId', '==', uid)
    );
    const propsSnap = await runInInjectionContext(this.injector, () =>
      getDocs(propsQ)
    );

    for (const p of propsSnap.docs) {
      const propRef = doc(this.afs, 'properties', p.id);

      await this.deleteSubcollectionBatch(propRef, 'payments');
      await this.deleteSubcollectionBatch(propRef, 'activity');

      if (options.deleteStorage) {
        await this.deleteStorageFolderRecursive(`properties/${p.id}/`);
      }

      await runInInjectionContext(this.injector, () => deleteDoc(propRef));
    }

    await runInInjectionContext(this.injector, () =>
      deleteDoc(doc(this.afs, 'users', uid))
    ).catch(() => null);

    if (options.deleteStorage) {
      await this.deleteStorageFolderRecursive(`users/${uid}/`);
    }

    await deleteUser(user);
  }
}
