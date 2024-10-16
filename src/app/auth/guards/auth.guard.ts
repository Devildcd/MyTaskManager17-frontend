import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn().pipe(
    map((isLoggedIn) => {
      if (isLoggedIn) {
        return true;
      } else {
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: state.url },
        });
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/auth/login']);
      return of(false);
    }),
  );
};
