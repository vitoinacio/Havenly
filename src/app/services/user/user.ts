import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from '@angular/fire/firestore';
import type { User } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private afs: Firestore) {}

  private isEmail(v?: string | null) {
    return !!v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }
  private clampName(v: string) {
    return v.trim().slice(0, 120);
  }

  async ensureUserDoc(u: User) {
    const ref = doc(this.afs, 'users', u.uid);
    const snap = await getDoc(ref);

    const displayName = (u.displayName || '').trim();
    const firstLast =
      displayName && displayName.includes(' ')
        ? displayName
        : displayName || (u.email ? u.email.split('@')[0] : '');

    if (!snap.exists()) {
      const payload: any = { updatedAt: serverTimestamp() };

      if (firstLast) payload.name = this.clampName(firstLast);
      if (this.isEmail(u.email)) payload.email = u.email!;

      await setDoc(ref, payload);
    } else {
      const current = snap.data() as any;
      const payload: any = { updatedAt: serverTimestamp() };

      const nextName = this.clampName(firstLast || current?.name || '');
      if (nextName) payload.name = nextName;

      if (this.isEmail(u.email)) payload.email = u.email!;
      else if (this.isEmail(current?.email)) payload.email = current.email;

      await setDoc(ref, payload, { merge: true });
    }
  }
}
