import { Component, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonApp, IonRouterOutlet, IonSpinner } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Capacitor } from '@capacitor/core';
import { AuthService } from './services/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonSpinner, IonApp, IonRouterOutlet],
})
export class AppComponent {
  private auth = inject(Auth);
  private router = inject(Router);
  private authSvc = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  loading = true;
  private hasNavigatedOnce = false;

  constructor() {
    this.boot();
  }

  private async boot() {
    try {
      if (!Capacitor.isNativePlatform()) {
        await this.authSvc.handleRedirectResult().catch(() => {});
      }
    } finally {
      authState(this.auth)
        .pipe(
          map(Boolean),
          distinctUntilChanged(),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe((isLoggedIn) => {
          this.loading = false;

          const publicKeeps = ['/login', '/register', '/reset'];
          const onPublicKeep = publicKeeps.some((p) =>
            this.router.url.startsWith(p)
          );

          const target = isLoggedIn ? '/home' : '/login';

          if (!this.hasNavigatedOnce) {
            this.hasNavigatedOnce = true;
            if (isLoggedIn && onPublicKeep) {
              this.router.navigateByUrl('/home', { replaceUrl: true });
            } else if (!this.router.url.startsWith(target)) {
              this.router.navigateByUrl(target, { replaceUrl: true });
            }
            return;
          }

          if (!this.router.url.startsWith(target)) {
            this.router.navigateByUrl(target, { replaceUrl: true });
          }
        });
    }
  }
}
