// =============================================================================
// errorInterceptor — Interceptor HTTP funcional (Angular 22)
// Responsabilidad: Traducir errores HTTP del backend (ProblemDetails .NET RFC 7807)
//                  a errores tipados del frontend.
// =============================================================================

import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import type { ProblemDetails } from '../interfaces/auth.interfaces';

/**
 * Error de aplicación normalizado para el frontend.
 * Los componentes siempre reciben este formato, nunca el HttpErrorResponse crudo.
 */
export class AppError {
  constructor(
    public readonly title: string,
    public readonly detail: string,
    public readonly status: number,
    public readonly fieldErrors: Record<string, string[]> = {},
  ) {}

  get isValidationError(): boolean {
    return this.status === 400 && Object.keys(this.fieldErrors).length > 0;
  }
}

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const appError = translateHttpError(error);

      // 401 Unauthorized: sesión expirada o token inválido → logout automático
      if (error.status === 401) {
        authService.logout();
      }

      // 403 Forbidden: redirigir a página de acceso denegado
      if (error.status === 403) {
        router.navigate(['/forbidden']);
      }

      return throwError(() => appError);
    }),
  );
};

/**
 * Traduce HttpErrorResponse (ProblemDetails .NET) a AppError tipado.
 */
function translateHttpError(error: HttpErrorResponse): AppError {
  // Error de red / CORS / servidor inaccesible
  if (error.status === 0) {
    return new AppError(
      'Error de conexión',
      'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      0,
    );
  }

  // Intentar parsear ProblemDetails del backend .NET
  const problem = error.error as ProblemDetails | null;

  if (problem && typeof problem === 'object' && 'title' in problem) {
    return new AppError(
      problem.title,
      problem.detail ?? 'Ha ocurrido un error inesperado.',
      error.status,
      problem.errors ?? {},
    );
  }

  // Fallback genérico por código HTTP
  return new AppError(
    getDefaultTitle(error.status),
    'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.',
    error.status,
  );
}

function getDefaultTitle(status: number): string {
  const titles: Record<number, string> = {
    400: 'Solicitud inválida',
    401: 'No autorizado',
    403: 'Acceso denegado',
    404: 'Recurso no encontrado',
    409: 'Conflicto de datos',
    422: 'Error de validación',
    429: 'Demasiadas solicitudes',
    500: 'Error interno del servidor',
    503: 'Servicio no disponible',
  };
  return titles[status] ?? 'Error desconocido';
}
