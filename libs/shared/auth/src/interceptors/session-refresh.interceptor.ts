// =============================================================================
// sessionRefreshInterceptor — Interceptor HTTP funcional (Angular 22)
// Responsabilidad única: ante un 401 en un endpoint protegido, renovar la sesión
// una sola vez y reintentar la petición original con el token nuevo.
//
// Cadena: [correlationId, sessionExpired, sessionRefresh, authToken, error]
// - En el flujo de retorno, errorInterceptor traduce primero a AppError. Por ello
//   se inspecciona `status` de forma polimórfica (AppError o HttpErrorResponse).
// - sessionRefresh se ejecuta antes que sessionExpired en el retorno, de modo que
//   el refresh se intenta primero. Si falla, el 401 original llega a
//   sessionExpired, que es la única responsable de limpiar la sesión.
// - Los endpoints /auth/* quedan excluidos: un 401 en login/refresh/logout nunca
//   dispara otro refresh (anti-bucle).
// =============================================================================

import {
  HttpContext,
  HttpContextToken,
  HttpErrorResponse,
  type HttpInterceptorFn,
  type HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Marca de contexto que impide un segundo refresh sobre una petición ya reintentada.
 */
export const SESSION_RETRIED = new HttpContextToken<boolean>(() => false);

/**
 * Extrae el código numérico de estado HTTP de forma tipada y polimórfica.
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
 * Determina si la URL pertenece al prefijo anónimo /auth/ (login, refresh, logout).
 */
function isAuthEndpoint(url: string): boolean {
  return /\/auth(\/|$)/.test(url);
}

/**
 * Clona la petición con SESSION_RETRIED=true preservando el resto del contexto.
 */
function markAsRetried(req: HttpRequest<unknown>): HttpRequest<unknown> {
  const context = new HttpContext();
  for (const token of req.context.keys()) {
    context.set(token, req.context.get(token));
  }
  context.set(SESSION_RETRIED, true);
  return req.clone({ context });
}

export const sessionRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tokenAtStart = authService.getToken();

  return next(req).pipe(
    catchError((error: unknown) => {
      const shouldRefresh = extractHttpStatus(error) === 401;
      const isRetry = req.context.get(SESSION_RETRIED);
      const isAuthRequest = isAuthEndpoint(req.url);

      if (!shouldRefresh || isRetry || isAuthRequest) {
        return throwError(() => error);
      }

      // Si el token cambió durante la petición, otro refresh ya se completó:
      // se reintenta directamente sin duplicar la llamada a /auth/refresh.
      if (authService.getToken() !== tokenAtStart) {
        return next(markAsRetried(req));
      }

      // Un único refresh (single-flight del coordinador). Si falla, se propaga
      // el error original para que sessionExpired gestione la sesión.
      return authService.refreshSession().pipe(
        catchError(() => throwError(() => error)),
        switchMap(() => next(markAsRetried(req))),
      );
    }),
  );
};
