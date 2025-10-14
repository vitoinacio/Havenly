import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { catchError, map, of, timeout, take } from 'rxjs';

export const AuthGuard: CanActivateFn = (_route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  const toLogin = () =>
    router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });

  return authState(auth).pipe(
    map((user) => (user ? true : toLogin())),
    timeout({ first: 5000, with: () => of(toLogin()) }),
    catchError(() => of(toLogin())),
    take(1)
  );
};
