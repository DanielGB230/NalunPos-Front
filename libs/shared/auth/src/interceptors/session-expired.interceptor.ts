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
// Se implementa extractHttpStatus(error) para inspeccionar 'status' de manera tipada y polimórfica,
// soportando tanto AppError en la cadena completa como HttpErrorResponse en ejecuciones aisladas o fallbacks.
// =============================================================================

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Extrae el código numérico de estado HTTP de manera tipada y polimórfica,
 * garantizando compatibilidad con AppError (emitido por errorInterceptor)
 * y HttpErrorResponse (emitido por el motor HTTP de Angular).
 */
function extractHttpStatus(error: unknown): number | null {
  if (error instanceof HttpErrorResponse) {
    return error.status;
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status: unknown }).status === 'number'
  ) {
    return (error as { status: number }).status;
  }
  return null;
}

/**
 * Determina si la URL pertenece a los endpoints anónimos de autenticación.
 */
function isAuthEndpointRequest(url: string): boolean {
  return (
    url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/logout')
  );
}

export const sessionExpiredInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      const status = extractHttpStatus(error);
      const isAuthRequest = isAuthEndpointRequest(req.url);

      if (status === 401) {
        // Regla: los endpoints anónimos de autenticación nunca deben provocar logout.
        // Un 401 en /auth/login se propaga al formulario; un 401 en /auth/refresh o
        // /auth/logout se propaga sin bucle logout -> 401 -> logout.
        if (!isAuthRequest) {
          authService.logout();
        }
      } else if (status === 403) {
        // Regla: 403 indica que el usuario está autenticado pero no tiene permisos.
        // Se redirige una sola vez a /forbidden sin destruir la sesión del usuario.
        // Los endpoints /auth/* quedan excluidos: un 403 de login/refresh/logout
        // debe propagarse al llamador, no enviar al usuario autenticado a /forbidden.
        if (!isAuthRequest) {
          router.navigate(['/forbidden']);
        }
      }

      return throwError(() => error);
    }),
  );
};
