// =============================================================================
// errorInterceptor.spec.ts — Unit Tests (Vitest)
// =============================================================================

import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { errorInterceptor } from './error.interceptor';
import { throwError } from 'rxjs';
import { AppError } from '../models/app-error.model';

describe('errorInterceptor', () => {
  it('debe capturar un error HTTP 400 ProblemDetails y convertirlo a AppError', () => {
    const req = new HttpRequest('GET', '/api/v1/error-test');
    const mockHttpError = new HttpErrorResponse({
      status: 400,
      statusText: 'Bad Request',
      error: {
        type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
        title: 'Bad Request',
        status: 400,
        detail: 'El correo electrónico ya existe.',
        errors: { Email: ['Email ya registrado'] },
      },
    });

    const nextFn = () => throwError(() => mockHttpError);

    let capturedError: AppError | undefined;

    errorInterceptor(req, nextFn).subscribe({
      next: () => expect.fail('Debería haber fallado con error HTTP'),
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    expect(capturedError).toBeDefined();
    expect(capturedError?.status).toBe(400);
    expect(capturedError?.message).toBe('El correo electrónico ya existe.');
    expect(capturedError?.details).toEqual({ Email: ['Email ya registrado'] });
  });

  it('debe retornar mensaje amigable de fallback cuando la respuesta de error 500 no trae ProblemDetails', () => {
    const req = new HttpRequest('GET', '/api/v1/server-error');
    const mockHttpError = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
      error: 'Raw server error',
    });

    const nextFn = () => throwError(() => mockHttpError);

    let capturedError: AppError | undefined;

    errorInterceptor(req, nextFn).subscribe({
      next: () => expect.fail('Debería haber fallado con 500'),
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    expect(capturedError).toBeDefined();
    expect(capturedError?.status).toBe(500);
    expect(capturedError?.message).toBe('Error interno del servidor. Por favor intenta más tarde.');
  });
});
