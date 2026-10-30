// =============================================================================
// authTokenInterceptor — Interceptor HTTP funcional (Angular 22)
// Responsabilidad única: Adjuntar el token de autorización Bearer exclusivamente
// a solicitudes dirigidas a la API interna (rutas relativas /api/ o que inician
// con APP_CONFIG.apiUrl), protegiendo contra fugas de credenciales a dominios externos.
// =============================================================================

import { inject } from '@angular/core';
import type { HttpInterceptorFn } from '@angular/common/http';
import { APP_CONFIG } from '@nalunpos/shared/data-access';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor funcional que inyecta el token Bearer en el header Authorization.
 *
 * Directrices arquitectónicas:
 * 1. Lee el token exclusivamente desde AuthService (Signal en memoria / sesión activa).
 * 2. Prohibido acceder directamente a sessionStorage en el interceptor.
 * 3. Valida que la URL pertenezca a la API autorizada (APP_CONFIG.apiUrl o prefijo relativo /api/).
 * 4. Nunca adjunta el header a URLs absolutas de terceros (evita filtración del token).
 */
export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const appConfig = inject(APP_CONFIG, { optional: true });

  const token = authService.getToken();
  if (!token) {
    return next(req);
  }

  const apiUrl = appConfig?.apiUrl?.trim() ?? '';
  const isRelativeApi = req.url.startsWith('/api/');
  const isTargetApiUrl = Boolean(apiUrl && req.url.startsWith(apiUrl));

  // Si no es un endpoint relativo de API ni coincide con la URL base de la API, no adjuntar token
  if (!isRelativeApi && !isTargetApiUrl) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
