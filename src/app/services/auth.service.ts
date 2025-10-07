import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root' // garante que o serviço pode ser injetado em qualquer lugar
})
export class AuthService {
  constructor(private auth: Auth) {}

  // Registrar usuário
  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  // Login
  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // Resetar senha
  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }
}