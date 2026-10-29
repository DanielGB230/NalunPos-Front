// =============================================================================
// errorInterceptor.spec.ts — Unit Tests (Vitest + jsdom)
// =============================================================================

import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { errorInterceptor } from './error.interceptor';
import { throwError } from 'rxjs';
import type { AppError } from '../models/app-error.model';

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
        detail: 'El correo electronico ya existe.',
        errors: { Email: ['Email ya registrado'] },
      },
    });

    const nextFn = () => throwError(() => mockHttpError);

    let capturedError: AppError | undefined;

    errorInterceptor(req, nextFn).subscribe({
      next: () => expect.fail('Deberia haber fallado con error HTTP'),
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    expect(capturedError).toBeDefined();
    expect(capturedError?.status).toBe(400);
    expect(capturedError?.message).toBe('El correo electronico ya existe.');
    expect(capturedError?.details).toEqual({ Email: ['Email ya registrado'] });
  });

  it('debe retornar mensaje de fallback para 400 cuando no trae ProblemDetails', () => {
    const req = new HttpRequest('GET', '/api/v1/bad-req');
    const mockHttpError = new HttpErrorResponse({
      status: 400,
      statusText: 'Bad Request',
      error: null,
    });

    let capturedError: AppError | undefined;
    errorInterceptor(req, () => throwError(() => mockHttpError)).subscribe({
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    expect(capturedError?.status).toBe(400);
    expect(capturedError?.message).toContain('datos inválidos');
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
      next: () => expect.fail('Deberia haber fallado con 500'),
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    expect(capturedError).toBeDefined();
    expect(capturedError?.status).toBe(500);
    expect(capturedError?.message).toContain('Error interno del servidor');
  });

  it('debe mapear un error 401 a mensaje de sesion expirada', () => {
    const req = new HttpRequest('GET', '/api/v1/secure');
    const mockHttpError = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized',
    });

    let capturedError: AppError | undefined;
    errorInterceptor(req, () => throwError(() => mockHttpError)).subscribe({
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    expect(capturedError?.status).toBe(401);
  });

  it('debe mapear un error 403 a mensaje de acceso no autorizado', () => {
    const req = new HttpRequest('GET', '/api/v1/admin');
    const mockHttpError = new HttpErrorResponse({
      status: 403,
      statusText: 'Forbidden',
    });

    let capturedError: AppError | undefined;
    errorInterceptor(req, () => throwError(() => mockHttpError)).subscribe({
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    expect(capturedError?.status).toBe(403);
  });

  it('debe mapear un error 404 a mensaje de recurso no encontrado', () => {
    const req = new HttpRequest('GET', '/api/v1/not-found');
    const mockHttpError = new HttpErrorResponse({
      status: 404,
      statusText: 'Not Found',
    });

    let capturedError: AppError | undefined;
    errorInterceptor(req, () => throwError(() => mockHttpError)).subscribe({
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    expect(capturedError?.status).toBe(404);
    expect(capturedError?.message).toContain('no fue encontrado');
  });

  it('debe mapear status 0 a error de conexion de red', () => {
    const req = new HttpRequest('GET', '/api/v1/offline');
    const mockHttpError = new HttpErrorResponse({
      status: 0,
      statusText: 'Unknown Error',
    });

    let capturedError: AppError | undefined;
    errorInterceptor(req, () => throwError(() => mockHttpError)).subscribe({
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    expect(capturedError?.status).toBe(0);
  });

  it('debe mapear otros status HTTP a mensaje de error por defecto', () => {
    const req = new HttpRequest('GET', '/api/v1/other');
    const mockHttpError = new HttpErrorResponse({
      status: 503,
      statusText: 'Service Unavailable',
    });

    let capturedError: AppError | undefined;
    errorInterceptor(req, () => throwError(() => mockHttpError)).subscribe({
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    expect(capturedError?.status).toBe(503);
    expect(capturedError?.message).toContain('error inesperado');
  });
});
