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
    return v.trim().replace(/\s+/g, ' ').slice(0, 120);
  }

  private pruneNullish<T extends Record<string, any>>(obj: T): Partial<T> {
    const out: Partial<T> = {};
    for (const k of Object.keys(obj) as (keyof T)[]) {
      const val = obj[k];
      if (val !== null && val !== undefined) {
        out[k] = val;
      }
    }
    return out;
  }

  async ensureUserDoc(u: User | null | undefined) {
    if (!u) return;

    const ref = doc(this.afs, 'users', u.uid);
    const snap = await getDoc(ref);

    const displayName = (u.displayName || '').trim();
    const firstLast =
      displayName && displayName.includes(' ')
        ? displayName
        : displayName || (u.email ? u.email.split('@')[0] : '');

    const base = this.pruneNullish({
      name: firstLast ? this.clampName(firstLast) : undefined,
      email: this.isEmail(u.email) ? (u.email as string) : undefined,
      photoURL:
        typeof u.photoURL === 'string' && u.photoURL.trim()
          ? u.photoURL.trim()
          : undefined,
      updatedAt: serverTimestamp(),
    });

    if (!snap.exists()) {
      const createPayload = this.pruneNullish({
        ...base,
        createdAt: serverTimestamp(),
      });
      await setDoc(ref, createPayload);
      return;
    }

    await setDoc(ref, base, { merge: true });
  }
}
