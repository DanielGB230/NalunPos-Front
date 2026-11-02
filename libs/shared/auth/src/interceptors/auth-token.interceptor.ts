// =============================================================================
// authTokenInterceptor — Interceptor HTTP funcional (Angular 22)
// Responsabilidad única: Adjuntar el token de autorización Bearer exclusivamente
// a solicitudes dirigidas a la API interna autorizada, evaluando el origen exacto
// (requestUrl.origin) y pathname seguro, protegiendo contra fugas de credenciales
// ante colisiones de prefijo de dominio, subdominios o puertos no autorizados.
// =============================================================================

import { inject } from '@angular/core';
import type { HttpInterceptorFn } from '@angular/common/http';
import { APP_CONFIG } from '@nalunpos/shared/data-access';
import { AuthService } from '../services/auth.service';

/**
 * Determina de forma segura y estricta si una petición HTTP es elegible para recibir
 * el header 'Authorization: Bearer <token>', comparando orígenes parseados (URL.origin)
 * y rutas válidas, en lugar de comparaciones de cadenas o prefijos vulnerables (startsWith).
 */
export function isAuthorizedApiRequest(
  requestUrlString: string,
  baseURI: string,
  configuredApiUrlString?: string,
): boolean {
  // Las URLs relativas al protocolo (ej. //evil.io/api/) nunca deben tratarse como rutas del mismo origen
  if (requestUrlString.startsWith('//')) {
    return false;
  }

  try {
    const baseOrigin = new URL(baseURI).origin;
    const requestUrl = new URL(requestUrlString, baseURI);

    // Condición a: Ruta relativa a la API en el mismo origen de la aplicación
    const isSameOriginApi =
      requestUrl.origin === baseOrigin && requestUrl.pathname.startsWith('/api/');

    if (isSameOriginApi) {
      return true;
    }

    // Condición b: Origen exacto de APP_CONFIG.apiUrl
    if (configuredApiUrlString && configuredApiUrlString.trim() !== '') {
      try {
        const configuredApiUrl = new URL(configuredApiUrlString, baseURI);
        const isConfiguredOrigin = requestUrl.origin === configuredApiUrl.origin;

        // Pathname base configurado (si existe una ruta base en apiUrl) o '/api/'
        const configuredBasePath = configuredApiUrl.pathname.replace(/\/+$/, '');
        const hasValidPath =
          configuredBasePath && configuredBasePath !== ''
            ? requestUrl.pathname.startsWith(configuredBasePath)
            : requestUrl.pathname.startsWith('/api/');

        if (isConfiguredOrigin && hasValidPath) {
          return true;
        }
      } catch {
        return false;
      }
    }

    return false;
  } catch {
    // Si la URL es malformada o inválida, no adjuntar credenciales
    return false;
  }
}

/**
 * Interceptor funcional que inyecta el token Bearer en el header Authorization.
 *
 * Directrices arquitectónicas:
 * 1. Lee el token exclusivamente desde AuthService (Signal en memoria / sesión activa).
 * 2. Prohibido acceder directamente a sessionStorage en el interceptor.
 * 3. Valida el origen exacto contra URL.origin de document.baseURI o APP_CONFIG.apiUrl.
 * 4. Maneja URLs malformadas de forma silenciosa sin adjuntar el token.
 * 5. Protege contra colisión de prefijo de dominio, puertos y URLs relativas al protocolo.
 */
export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const appConfig = inject(APP_CONFIG, { optional: true });

  const token = authService.getToken();
  if (!token) {
    return next(req);
  }

  const baseURI =
    typeof document !== 'undefined' && document.baseURI ? document.baseURI : 'http://localhost';

  if (!isAuthorizedApiRequest(req.url, baseURI, appConfig?.apiUrl)) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
