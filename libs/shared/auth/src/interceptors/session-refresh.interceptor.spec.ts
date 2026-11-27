import '@angular/compiler';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpContext, HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { SESSION_RETRIED, sessionRefreshInterceptor } from './session-refresh.interceptor';

describe('sessionRefreshInterceptor (Pruebas Unitarias Aisladas)', () => {
  let authServiceMock: {
    getToken: ReturnType<typeof vi.fn>;
    refreshSession: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authServiceMock = {
      getToken: vi.fn(),
      refreshSession: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function execute(
    req: HttpRequest<unknown>,
    nextFn: (request: HttpRequest<unknown>) => ReturnType<typeof of>,
  ): { capturedRequests: HttpRequest<unknown>[]; error: unknown; completed: boolean } {
    const capturedRequests: HttpRequest<unknown>[] = [];
    let error: unknown;
    let completed = false;

    TestBed.runInInjectionContext(() =>
      sessionRefreshInterceptor(req, (request) => {
        capturedRequests.push(request);
        return nextFn(request);
      }).subscribe({
        error: (err) => {
          error = err;
        },
        complete: () => {
          completed = true;
        },
      }),
    );

    return { capturedRequests, error, completed };
  }

  it('debe refrescar ante 401 y reintentar una sola vez marcando SESSION_RETRIED', () => {
    authServiceMock.getToken.mockReturnValue('token-old');
    authServiceMock.refreshSession.mockReturnValue(of(undefined));

    const httpError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const nextFn = vi
      .fn()
      .mockReturnValueOnce(throwError(() => httpError))
      .mockReturnValueOnce(of(new HttpResponse({ status: 200 })));

    const result = execute(new HttpRequest('GET', '/api/v1/categories'), nextFn);

    expect(authServiceMock.refreshSession).toHaveBeenCalledTimes(1);
    expect(nextFn).toHaveBeenCalledTimes(2);
    expect(result.capturedRequests[1]?.context.get(SESSION_RETRIED)).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.completed).toBe(true);
  });

  it('debe reintentar sin refrescar cuando otro refresh ya cambio el token durante la peticion', () => {
    authServiceMock.getToken.mockReturnValueOnce('token-old').mockReturnValue('token-new');

    const httpError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const nextFn = vi
      .fn()
      .mockReturnValueOnce(throwError(() => httpError))
      .mockReturnValueOnce(of(new HttpResponse({ status: 200 })));

    const result = execute(new HttpRequest('GET', '/api/v1/categories'), nextFn);

    expect(authServiceMock.refreshSession).not.toHaveBeenCalled();
    expect(nextFn).toHaveBeenCalledTimes(2);
    expect(result.capturedRequests[1]?.context.get(SESSION_RETRIED)).toBe(true);
    expect(result.completed).toBe(true);
  });

  it('NO debe refrescar ante 401 de un endpoint /auth/*', () => {
    authServiceMock.getToken.mockReturnValue('token-old');

    const httpError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const nextFn = vi.fn().mockReturnValue(throwError(() => httpError));

    const result = execute(new HttpRequest('POST', '/api/v1/auth/refresh'), nextFn);

    expect(authServiceMock.refreshSession).not.toHaveBeenCalled();
    expect(nextFn).toHaveBeenCalledTimes(1);
    expect(result.error).toBe(httpError);
  });

  it('NO debe refrescar ni reintentar si el reintento ya esta marcado con SESSION_RETRIED', () => {
    authServiceMock.getToken.mockReturnValue('token-old');

    const httpError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const nextFn = vi.fn().mockReturnValue(throwError(() => httpError));
    const retriedRequest = new HttpRequest('GET', '/api/v1/categories').clone({
      context: new HttpContext().set(SESSION_RETRIED, true),
    });

    const result = execute(retriedRequest, nextFn);

    expect(authServiceMock.refreshSession).not.toHaveBeenCalled();
    expect(nextFn).toHaveBeenCalledTimes(1);
    expect(result.error).toBe(httpError);
  });

  it('debe propagar el error original cuando el refresh falla y no reintentar', () => {
    authServiceMock.getToken.mockReturnValue('token-old');
    authServiceMock.refreshSession.mockReturnValue(throwError(() => new Error('refresh failed')));

    const httpError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const nextFn = vi.fn().mockReturnValue(throwError(() => httpError));

    const result = execute(new HttpRequest('GET', '/api/v1/categories'), nextFn);

    expect(authServiceMock.refreshSession).toHaveBeenCalledTimes(1);
    expect(nextFn).toHaveBeenCalledTimes(1);
    expect(result.error).toBe(httpError);
  });

  it('NO debe refrescar ni reintentar ante errores distintos de 401', () => {
    authServiceMock.getToken.mockReturnValue('token-old');

    const httpError = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    const nextFn = vi.fn().mockReturnValue(throwError(() => httpError));

    const result = execute(new HttpRequest('GET', '/api/v1/categories'), nextFn);

    expect(authServiceMock.refreshSession).not.toHaveBeenCalled();
    expect(nextFn).toHaveBeenCalledTimes(1);
    expect(result.error).toBe(httpError);
  });

  it('debe refrescar y reintentar ante un AppError con status 401 emitido aguas abajo', () => {
    authServiceMock.getToken.mockReturnValue('token-old');
    authServiceMock.refreshSession.mockReturnValue(of(undefined));

    const appError = { code: 'UNAUTHORIZED', message: 'Sesión expirada', status: 401 };
    const nextFn = vi
      .fn()
      .mockReturnValueOnce(throwError(() => appError))
      .mockReturnValueOnce(of(new HttpResponse({ status: 200 })));

    const result = execute(new HttpRequest('GET', '/api/v1/categories'), nextFn);

    expect(authServiceMock.refreshSession).toHaveBeenCalledTimes(1);
    expect(nextFn).toHaveBeenCalledTimes(2);
    expect(result.completed).toBe(true);
  });

  it('NO debe refrescar ni reintentar ante errores no estructurados sin status', () => {
    authServiceMock.getToken.mockReturnValue('token-old');

    const plainError = new Error('Conexión perdida');
    const nextFn = vi.fn().mockReturnValue(throwError(() => plainError));

    const result = execute(new HttpRequest('GET', '/api/v1/categories'), nextFn);

    expect(authServiceMock.refreshSession).not.toHaveBeenCalled();
    expect(nextFn).toHaveBeenCalledTimes(1);
    expect(result.error).toBe(plainError);
  });

  it('NO debe refrescar cuando el status del error no es numerico', () => {
    authServiceMock.getToken.mockReturnValue('token-old');

    const malformedError = { code: 'UNAUTHORIZED', status: '401' };
    const nextFn = vi.fn().mockReturnValue(throwError(() => malformedError));

    const result = execute(new HttpRequest('GET', '/api/v1/categories'), nextFn);

    expect(authServiceMock.refreshSession).not.toHaveBeenCalled();
    expect(nextFn).toHaveBeenCalledTimes(1);
    expect(result.error).toBe(malformedError);
  });
});
