import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AlertService } from '../../shared/services/alert.service';

export const bodyguardInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const alertService = inject(AlertService);
  const router = inject(Router);

  const token = localStorage.getItem('auth_token');
  //console.log(token);

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        alertService.showError(
          'Session expired. Please log in again.',
          'Unauthorized',
        );
        authService.logout();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    }),
  );
};
