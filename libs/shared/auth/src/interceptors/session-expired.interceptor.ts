// =============================================================================
// sessionExpiredInterceptor — Interceptor HTTP funcional (Angular 22)
// Responsabilidad única: Gestión del ciclo de vida de sesión ante respuestas HTTP
// de error 401 (no autorizado / sesión expirada) y 403 (acceso prohibido).
//
// Flujo y tipado de errores en la cadena de interceptores:
// Cadena: [correlationIdInterceptor, sessionExpiredInterceptor, sessionRefreshInterceptor, authTokenInterceptor, errorInterceptor]
//
// Debido a que errorInterceptor está configurado después en el arreglo de withInterceptors,
// en el flujo de retorno (subida de RxJS) su catchError se ejecuta en PRIMER lugar, traduciendo
// el HttpErrorResponse nativo a un objeto AppError fuertemente tipado ({ code, message, status, details }).
//
// Por ello, sessionExpiredInterceptor recibe en su catchError principalmente una instancia de AppError.
// La inspección polimórfica de 'status' y la clasificación de rutas anónimas se delegan en
// session-http.helpers: solo /auth/login, /auth/refresh y /auth/logout son anónimas;
// /auth/me y cualquier otra ruta /auth/* son protegidas.
// =============================================================================

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import type { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { extractHttpStatus, isAnonymousAuthEndpoint } from './session-http.helpers';

export const sessionExpiredInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      const status = extractHttpStatus(error);
      const isAnonymousAuthRequest = isAnonymousAuthEndpoint(req.url);

      if (status === 401) {
        // Regla: las tres rutas anónimas de autenticación nunca deben provocar logout.
        // Un 401 en /auth/login se propaga al formulario; un 401 en /auth/refresh o
        // /auth/logout se propaga sin bucle logout -> 401 -> logout.
        // /auth/me es protegida: su 401 sí limpia la sesión.
        if (!isAnonymousAuthRequest) {
          authService.logout();
        }
      } else if (status === 403) {
        // Regla: 403 indica que el usuario está autenticado pero no tiene permisos.
        // Se redirige una sola vez a /forbidden sin destruir la sesión del usuario.
        // Solo las tres rutas anónimas quedan excluidas; /auth/me es protegida y
        // su 403 sí navega a /forbidden.
        if (!isAnonymousAuthRequest) {
          router.navigate(['/forbidden']);
        }
      }

      return throwError(() => error);
    }),
  );
};
