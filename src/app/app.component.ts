import { Component, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonApp, IonRouterOutlet, IonSpinner } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonSpinner, IonApp, IonRouterOutlet],
})
export class AppComponent {
  private auth = inject(Auth);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  loading = true;

  constructor() {
    this.boot();
  }

  private async boot() {
    try {
      const firstIsLoggedIn = await firstValueFrom(
        authState(this.auth).pipe(map(Boolean))
      );
      await this.ensureRoute(firstIsLoggedIn);

      authState(this.auth)
        .pipe(
          map(Boolean),
          distinctUntilChanged(),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe((isLoggedIn) => {
          this.ensureRoute(isLoggedIn);
        });
    } finally {
      this.loading = false;
    }
  }

  private async ensureRoute(isLoggedIn: boolean) {
    const publicKeeps = ['/login', '/register', '/reset'];
    const url = this.router.url || '/';
    const onPublicKeep = publicKeeps.some((p) => url.startsWith(p));
    const target = isLoggedIn ? '/home' : '/login';

    if (url.startsWith(target)) {
      return;
    }

    if (isLoggedIn && onPublicKeep) {
      await this.router.navigateByUrl('/home', { replaceUrl: true });
      return;
    }

    if (!isLoggedIn && !onPublicKeep) {
      await this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }
}
