import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonApp, IonRouterOutlet, IonSpinner } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonSpinner, IonApp, IonRouterOutlet],
})
export class AppComponent {
  private auth = inject(Auth);
  private router = inject(Router);

  loading = true;
  private hasNavigatedOnce = false;

  constructor() {
    authState(this.auth)
      .pipe(map(Boolean), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((isLoggedIn) => {
        this.loading = false;
        const target = isLoggedIn ? '/home' : '/login';
        if (!this.hasNavigatedOnce || !this.router.url.startsWith(target)) {
          this.hasNavigatedOnce = true;
          this.router.navigateByUrl(target, { replaceUrl: true });
        }
      });
  }
}
