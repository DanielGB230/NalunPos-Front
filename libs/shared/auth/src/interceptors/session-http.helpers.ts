// =============================================================================
// session-http.helpers — Utilidades compartidas de la cadena HTTP de sesión
// Responsabilidad única: centralizar la extracción del status HTTP y la
// clasificación de endpoints anónimos de autenticación para los interceptores
// sessionExpiredInterceptor y sessionRefreshInterceptor.
// =============================================================================

import { HttpErrorResponse } from '@angular/common/http';

/**
 * Extrae el código numérico de estado HTTP de forma tipada y polimórfica,
 * garantizando compatibilidad con AppError (emitido por errorInterceptor)
 * y HttpErrorResponse (emitido por el motor HTTP de Angular).
 */
export function extractHttpStatus(error: unknown): number | null {
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
 * Determina si la URL corresponde exactamente a una de las tres rutas anónimas
 * de autenticación: `/auth/login`, `/auth/refresh` o `/auth/logout`.
 * Tolera host absoluto y query string. `/auth/me` es una ruta protegida y, por
 * tanto, NO se clasifica como anónima.
 */
export function isAnonymousAuthEndpoint(url: string): boolean {
  const path = url.replace(/[?#].*$/, '');
  return /\/auth\/(?:login|refresh|logout)$/.test(path);
}
