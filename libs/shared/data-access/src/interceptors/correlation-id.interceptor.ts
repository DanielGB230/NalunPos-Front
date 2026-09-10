// =============================================================================
// correlationIdInterceptor — NalunPos Data Access
// Inyecta un X-Correlation-Id único (UUID v4) en cada petición HTTP saliente
// para trazabilidad de logs distribuida backend/frontend.
// =============================================================================

import { HttpInterceptorFn } from '@angular/common/http';

export const correlationIdInterceptor: HttpInterceptorFn = (req, next) => {
  const correlationId = crypto.randomUUID
    ? crypto.randomUUID()
    : 'corr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);

  const reqWithCorrelation = req.clone({
    setHeaders: {
      'X-Correlation-Id': correlationId,
    },
  });

  return next(reqWithCorrelation);
};
