// =============================================================================
// authInterceptor — Interceptor HTTP funcional (Angular 22)
// Responsabilidad: Adjuntar el token Bearer desde sessionStorage y gestionar
//                  errores 401 (logout y redirección a /login) y 403 (redirección a /forbidden).
// =============================================================================

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = sessionStorage.getItem('nalunpos_token');

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          authService.logout();
          router.navigate(['/login']);
        } else if (error.status === 403) {
          router.navigate(['/forbidden']);
        }
      }
      return throwError(() => error);
    }),
  );
};
