// =============================================================================
// authInterceptor — Interceptor HTTP funcional (Angular 22)
// Responsabilidad: Adjuntar el token Bearer desde sessionStorage a todas las
//                  solicitudes HTTP que van hacia la API de NalunPos.
// =============================================================================

import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('nalunpos_token');

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }

  return next(req);
};
