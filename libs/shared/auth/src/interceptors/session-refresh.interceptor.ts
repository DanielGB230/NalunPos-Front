// =============================================================================
// sessionRefreshInterceptor — Interceptor HTTP funcional (Angular 22)
// Responsabilidad única: ante un 401 en un endpoint protegido, renovar la sesión
// una sola vez y reintentar la petición original con el token nuevo.
//
// Cadena: [correlationId, sessionExpired, sessionRefresh, authToken, error]
// - En el flujo de retorno, errorInterceptor traduce primero a AppError. Por ello
//   la inspección polimórfica de `status` se delega en session-http.helpers.
// - sessionRefresh se ejecuta antes que sessionExpired en el retorno, de modo que
//   el refresh se intenta primero. Si falla, el 401 original llega a
//   sessionExpired, que es la única responsable de limpiar la sesión.
// - Solo las rutas anónimas /auth/login, /auth/refresh y /auth/logout se excluyen:
//   un 401 en ellas nunca dispara otro refresh (anti-bucle). /auth/me es una ruta
//   protegida y, por tanto, SÍ dispara refresh y reintento.
// =============================================================================

import {
  HttpContext,
  HttpContextToken,
  type HttpInterceptorFn,
  type HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { extractHttpStatus, isAnonymousAuthEndpoint } from './session-http.helpers';

/**
 * Marca de contexto que impide un segundo refresh sobre una petición ya reintentada.
 */
export const SESSION_RETRIED = new HttpContextToken<boolean>(() => false);

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
      const isAnonymousAuthRequest = isAnonymousAuthEndpoint(req.url);

      if (!shouldRefresh || isRetry || isAnonymousAuthRequest) {
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
