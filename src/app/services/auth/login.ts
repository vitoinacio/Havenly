
import { Injectable } from '@angular/core';
import { userType } from '../../models/auth';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, User } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class Login {
  constructor(private auth: Auth) {}

  async register(user: userType, password: string): Promise<User | null> {
    const cred = await createUserWithEmailAndPassword(this.auth, user.email, password);
    if (cred.user) {
      await updateProfile(cred.user, { displayName: user.name });
      return cred.user;
    }
    return null;
  }

  async login(email: string, password: string): Promise<User | null> {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    return cred.user;
  }

  // Futuramente: método para atualizar telefone
  // async updatePhone(phone: string): Promise<void> { ... }
}
