import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from '@angular/fire/firestore';
import type { User } from '@angular/fire/auth';

type ProviderId = 'password' | 'google.com' | 'facebook.com' | string;

export interface UserDoc {
  name?: string;
  email?: string;
  photoURL?: string | null;
  providers?: ProviderId[];
  createdAt?: any;
  updatedAt?: any;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private afs: Firestore) {}

  private isEmail(v?: string | null) {
    return !!v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  private clampName(v: string) {
    return v.trim().replace(/\s+/g, ' ').slice(0, 120);
  }

  async ensureUserDoc(u: User | null | undefined) {
    if (!u) return; // nada a fazer

    const ref = doc(this.afs, 'users', u.uid);
    const snap = await getDoc(ref);

    const displayName = (u.displayName || '').trim();
    const firstLast =
      displayName && displayName.includes(' ')
        ? displayName
        : displayName || (u.email ? u.email.split('@')[0] : '');

    const next: Partial<UserDoc> = {
      updatedAt: serverTimestamp(),
    };

    if (firstLast) next.name = this.clampName(firstLast);
    if (this.isEmail(u.email)) next.email = u.email!;
    if (u.photoURL) next.photoURL = u.photoURL;
    if (u.providerData?.length) {
      next.providers = u.providerData
        .map((p) => p?.providerId)
        .filter(Boolean) as ProviderId[];
    }

    if (!snap.exists()) {
      await setDoc(ref, { ...next, createdAt: serverTimestamp() } as UserDoc);
      return;
    }
    const current = (snap.data() || {}) as UserDoc;
    const payload: Partial<UserDoc> = { updatedAt: serverTimestamp() };

    const name = next.name ?? current.name;
    if (name && name !== current.name) payload.name = name;

    const email = next.email ?? current.email;
    if (email && email !== current.email) payload.email = email;

    const photoURL = (next.photoURL ?? current.photoURL) || null;
    if (photoURL !== (current.photoURL ?? null)) payload.photoURL = photoURL;

    const providers = next.providers ?? current.providers ?? [];
    const providersChanged =
      providers.length !== (current.providers?.length ?? 0) ||
      providers.some((p, i) => p !== current.providers?.[i]);
    if (providersChanged) payload.providers = providers;

    await setDoc(ref, payload, { merge: true });
  }
}
