// =============================================================================
// errorInterceptor — NalunPos Data Access
// Captura respuestas de error HTTP (400, 401, 403, 404, 500) y traduce el formato
// RFC 7807 (ProblemDetails de .NET 9) a objetos AppError fuertemente tipados.
// =============================================================================

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AppError, ProblemDetails } from '../models/app-error.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const appError: AppError = parseHttpError(error);
      return throwError(() => appError);
    })
  );
};

function parseHttpError(error: HttpErrorResponse): AppError {
  if (error.error && typeof error.error === 'object') {
    const problem = error.error as ProblemDetails;
    return {
      code: problem.type ?? `HTTP_${error.status}`,
      message: problem.detail || problem.title || getFallbackMessage(error.status),
      status: error.status,
      details: problem.errors,
    };
  }

  return {
    code: `HTTP_${error.status}`,
    message: getFallbackMessage(error.status),
    status: error.status,
  };
}

function getFallbackMessage(status: number): string {
  switch (status) {
    case 400:
      return 'La solicitud contiene datos inválidos.';
    case 401:
      return 'Credenciales inválidas o sesión expirada.';
    case 403:
      return 'No tienes permisos para realizar esta acción.';
    case 404:
      return 'El recurso solicitado no fue encontrado.';
    case 500:
      return 'Error interno del servidor. Por favor intenta más tarde.';
    case 0:
      return 'No fue posible conectar con el servidor. Verifica tu conexión.';
    default:
      return 'Ocurrió un error inesperado al procesar la solicitud.';
  }
}
