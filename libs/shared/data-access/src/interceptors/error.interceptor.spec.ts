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

  it('debe usar HTTP_status cuando problem.code no está presente y usar title cuando detail está vacío', () => {
    const req = new HttpRequest('GET', '/api/v1/no-type');
    const mockHttpError = new HttpErrorResponse({
      status: 422,
      error: {
        title: 'Unprocessable Entity Title',
      },
    });

    let capturedError: AppError | undefined;
    errorInterceptor(req, () => throwError(() => mockHttpError)).subscribe({
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    expect(capturedError?.code).toBe('HTTP_422');
    expect(capturedError?.message).toBe('Unprocessable Entity Title');
  });

  it('debe recurrir a getFallbackMessage cuando problem no tiene detail ni title', () => {
    const req = new HttpRequest('GET', '/api/v1/empty-problem');
    const mockHttpError = new HttpErrorResponse({
      status: 400,
      error: {},
    });

    let capturedError: AppError | undefined;
    errorInterceptor(req, () => throwError(() => mockHttpError)).subscribe({
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    expect(capturedError?.code).toBe('HTTP_400');
    expect(capturedError?.message).toContain('datos inválidos');
  });

  it('debe usar problem.code "Auth.RefreshTokenInvalid" en un 401 cuando el backend lo expone', () => {
    const req = new HttpRequest('POST', '/api/v1/auth/refresh');
    const mockHttpError = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized',
      error: {
        type: 'https://nalunpos.com/errors/refresh-token-invalid',
        title: 'Unauthorized',
        status: 401,
        code: 'Auth.RefreshTokenInvalid',
      },
    });

    let capturedError: AppError | undefined;
    errorInterceptor(req, () => throwError(() => mockHttpError)).subscribe({
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    expect(capturedError?.code).toBe('Auth.RefreshTokenInvalid');
  });

  it('debe usar problem.code "Auth.RefreshConcurrent" en un 409', () => {
    const req = new HttpRequest('POST', '/api/v1/auth/refresh');
    const mockHttpError = new HttpErrorResponse({
      status: 409,
      statusText: 'Conflict',
      error: {
        title: 'Conflict',
        status: 409,
        code: 'Auth.RefreshConcurrent',
      },
    });

    let capturedError: AppError | undefined;
    errorInterceptor(req, () => throwError(() => mockHttpError)).subscribe({
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    expect(capturedError?.code).toBe('Auth.RefreshConcurrent');
    expect(capturedError?.status).toBe(409);
  });

  it('debe usar problem.code en un 403 de tenant suspendido', () => {
    const req = new HttpRequest('GET', '/api/v1/warehouses');
    const mockHttpError = new HttpErrorResponse({
      status: 403,
      statusText: 'Forbidden',
      error: {
        title: 'Forbidden',
        status: 403,
        code: 'Tenant.Suspended',
      },
    });

    let capturedError: AppError | undefined;
    errorInterceptor(req, () => throwError(() => mockHttpError)).subscribe({
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    expect(capturedError?.code).toBe('Tenant.Suspended');
    expect(capturedError?.status).toBe(403);
  });

  it('debe ignorar problem.type y recurrir a HTTP_status cuando problem.code no está presente', () => {
    const req = new HttpRequest('GET', '/api/v1/public');
    const mockHttpError = new HttpErrorResponse({
      status: 400,
      statusText: 'Bad Request',
      error: {
        type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
        title: 'Bad Request',
        status: 400,
        detail: 'Solicitud inválida.',
      },
    });

    let capturedError: AppError | undefined;
    errorInterceptor(req, () => throwError(() => mockHttpError)).subscribe({
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    expect(capturedError?.code).toBe('HTTP_400');
  });

  it('debe usar HTTP_status cuando la respuesta de error no tiene cuerpo', () => {
    const req = new HttpRequest('GET', '/api/v1/no-body');
    const mockHttpError = new HttpErrorResponse({
      status: 503,
      statusText: 'Service Unavailable',
      error: null,
    });

    let capturedError: AppError | undefined;
    errorInterceptor(req, () => throwError(() => mockHttpError)).subscribe({
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    expect(capturedError?.code).toBe('HTTP_503');
    expect(capturedError?.status).toBe(503);
  });
});
