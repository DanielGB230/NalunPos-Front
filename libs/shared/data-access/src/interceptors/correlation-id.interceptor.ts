// =============================================================================
// correlationIdInterceptor — NalunPos Data Access
// Inyecta un X-Correlation-Id único (UUID v4) en cada petición HTTP saliente
// para trazabilidad de logs distribuida backend/frontend.
// =============================================================================

import type { HttpInterceptorFn } from '@angular/common/http';

export const correlationIdInterceptor: HttpInterceptorFn = (req, next) => {
  const correlationId = crypto.randomUUID();

  const reqWithCorrelation = req.clone({
    setHeaders: {
      'X-Correlation-Id': correlationId,
    },
  });

  return next(reqWithCorrelation);
};
