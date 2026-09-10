// =============================================================================
// correlationIdInterceptor — Interceptor HTTP funcional (Angular 22)
// Responsabilidad: Generar y adjuntar un X-Correlation-Id único por request.
// Propósito: Trazabilidad de requests en logs del backend (preparado para Fase 3 ADR-0010).
// =============================================================================

import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Genera un UUID v4 simple sin dependencias externas.
 */
function generateCorrelationId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export const correlationIdInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const correlationId = generateCorrelationId();

  const requestWithCorrelationId = req.clone({
    setHeaders: {
      'X-Correlation-Id': correlationId,
    },
  });

  return next(requestWithCorrelationId);
};
