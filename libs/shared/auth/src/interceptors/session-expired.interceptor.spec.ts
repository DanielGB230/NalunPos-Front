// =============================================================================
// session-expired.interceptor.spec.ts — Unit & Integration Tests (Vitest)
// Responsabilidad única: Verificar la gestión de ciclo de vida de sesión
// ante respuestas HTTP 401 y 403, tanto de forma unitaria aislada como en la
// cadena determinista completa de interceptores con HttpTestingController.
// =============================================================================

import '@angular/compiler';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpErrorResponse,
  HttpRequest,
  HttpResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import {
  APP_CONFIG,
  correlationIdInterceptor,
  errorInterceptor,
  type AppConfig,
  type AppError,
} from '@nalunpos/shared/data-access';
import { authTokenInterceptor } from './auth-token.interceptor';
import { sessionExpiredInterceptor } from './session-expired.interceptor';
import { AuthService } from '../services/auth.service';

describe('sessionExpiredInterceptor (Pruebas Unitarias Aisladas)', () => {
  let authServiceMock: { logout: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authServiceMock = {
      logout: vi.fn(),
    };
    routerMock = {
      navigate: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('debe ejecutar authService.logout() ante error 401 en endpoint protegido', () => {
    const req = new HttpRequest('GET', '/api/v1/warehouses');
    const httpError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const nextFn = vi.fn(() => throwError(() => httpError));

    let receivedError: unknown;
    TestBed.runInInjectionContext(() =>
      sessionExpiredInterceptor(req, nextFn).subscribe({
        error: (err) => {
          receivedError = err;
        },
      }),
    );

    expect(nextFn).toHaveBeenCalledOnce();
    expect(authServiceMock.logout).toHaveBeenCalledOnce();
    expect(receivedError).toBe(httpError);
  });

  it('debe soportar AppError con status 401 emitido aguas abajo por errorInterceptor', () => {
    const req = new HttpRequest('GET', '/api/v1/warehouses');
    const appError: AppError = {
      code: 'UNAUTHORIZED',
      message: 'Sesión expirada',
      status: 401,
    };
    const nextFn = vi.fn(() => throwError(() => appError));

    let receivedError: unknown;
    TestBed.runInInjectionContext(() =>
      sessionExpiredInterceptor(req, nextFn).subscribe({
        error: (err) => {
          receivedError = err;
        },
      }),
    );

    expect(authServiceMock.logout).toHaveBeenCalledOnce();
    expect(receivedError).toBe(appError);
  });

  it('NO debe llamar a logout() ante error 401 proveniente de /auth/login', () => {
    const req = new HttpRequest('POST', '/api/v1/auth/login', { email: 'bad@login.com' });
    const httpError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const nextFn = vi.fn(() => throwError(() => httpError));

    let receivedError: unknown;
    TestBed.runInInjectionContext(() =>
      sessionExpiredInterceptor(req, nextFn).subscribe({
        error: (err) => {
          receivedError = err;
        },
      }),
    );

    expect(nextFn).toHaveBeenCalledOnce();
    expect(authServiceMock.logout).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(receivedError).toBe(httpError);
  });

  it('debe redirigir a /forbidden sin hacer logout ante error 403', () => {
    const req = new HttpRequest('GET', '/api/v1/tenants');
    const httpError = new HttpErrorResponse({ status: 403, statusText: 'Forbidden' });
    const nextFn = vi.fn(() => throwError(() => httpError));

    let receivedError: unknown;
    TestBed.runInInjectionContext(() =>
      sessionExpiredInterceptor(req, nextFn).subscribe({
        error: (err) => {
          receivedError = err;
        },
      }),
    );

    expect(nextFn).toHaveBeenCalledOnce();
    expect(authServiceMock.logout).not.toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/forbidden']);
    expect(receivedError).toBe(httpError);
  });

  it('NO debe redirigir ni ejecutar logout ante otros errores HTTP (ej. 500)', () => {
    const req = new HttpRequest('GET', '/api/v1/products');
    const httpError = new HttpErrorResponse({ status: 500, statusText: 'Internal Error' });
    const nextFn = vi.fn(() => throwError(() => httpError));

    TestBed.runInInjectionContext(() =>
      sessionExpiredInterceptor(req, nextFn).subscribe({
        error: () => {
          /* expected */
        },
      }),
    );

    expect(authServiceMock.logout).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('debe propagar errores no estructurados sin alterar rutas ni estado', () => {
    const req = new HttpRequest('GET', '/api/v1/products');
    const unhandledError = new Error('Conexión perdida');
    const nextFn = vi.fn(() => throwError(() => unhandledError));

    let caught: unknown;
    TestBed.runInInjectionContext(() =>
      sessionExpiredInterceptor(req, nextFn).subscribe({
        error: (err) => {
          caught = err;
        },
      }),
    );

    expect(authServiceMock.logout).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(caught).toBe(unhandledError);
  });
});

describe('Cadena Completa de Interceptores HTTP (Test de Integración Real)', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let router: Router;
  let authService: AuthService;
  let routerNavigateSpy: ReturnType<typeof vi.spyOn>;
  let authServiceLogoutSpy: ReturnType<typeof vi.spyOn>;

  const mockAppConfig: AppConfig = {
    apiUrl: 'https://api.nalunpos.com',
    appName: 'NalunPos Test',
    production: false,
  };

  beforeEach(() => {
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        { provide: APP_CONFIG, useValue: mockAppConfig },
        provideHttpClient(
          withInterceptors([
            correlationIdInterceptor,
            authTokenInterceptor,
            sessionExpiredInterceptor,
            errorInterceptor,
          ]),
        ),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);

    routerNavigateSpy = vi
      .spyOn(router, 'navigate')
      .mockImplementation(() => Promise.resolve(true));
    authServiceLogoutSpy = vi.spyOn(authService, 'logout');
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('a) 401 en endpoint protegido (/api/v1/warehouses) → ejecuta logout() exactamente una vez y redirige a /login', () => {
    let capturedError: AppError | undefined;

    httpClient.get('/api/v1/warehouses').subscribe({
      next: () => expect.fail('La llamada debió fallar con 401'),
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    const req = httpMock.expectOne('/api/v1/warehouses');
    expect(req.request.headers.has('X-Correlation-Id')).toBe(true);

    req.flush(
      { title: 'Unauthorized', detail: 'El token ha expirado', status: 401 },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(authServiceLogoutSpy).toHaveBeenCalledTimes(1);
    expect(routerNavigateSpy).toHaveBeenCalledWith(['/login']);
    expect(capturedError?.status).toBe(401);
  });

  it('b) 401 en /api/v1/auth/login → NO ejecuta logout() ni redirige, y propaga el error al suscriptor', () => {
    let capturedError: AppError | undefined;

    httpClient
      .post('/api/v1/auth/login', { email: 'user@nalunpos.com', password: 'bad' })
      .subscribe({
        next: () => expect.fail('El login no debió ser exitoso'),
        error: (err: AppError) => {
          capturedError = err;
        },
      });

    const req = httpMock.expectOne('/api/v1/auth/login');
    req.flush(
      { title: 'BadCredentials', detail: 'Credenciales inválidas', status: 401 },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(authServiceLogoutSpy).not.toHaveBeenCalled();
    expect(routerNavigateSpy).not.toHaveBeenCalled();
    expect(capturedError?.status).toBe(401);
    expect(capturedError?.message).toBe('Credenciales inválidas');
  });

  it('c) 403 en endpoint protegido → redirige a /forbidden sin hacer logout()', () => {
    let capturedError: AppError | undefined;

    httpClient.get('/api/v1/admin/tenants').subscribe({
      next: () => expect.fail('La llamada debió fallar con 403'),
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    const req = httpMock.expectOne('/api/v1/admin/tenants');
    req.flush(
      { title: 'Forbidden', detail: 'No tienes el rol requerido', status: 403 },
      { status: 403, statusText: 'Forbidden' },
    );

    expect(authServiceLogoutSpy).not.toHaveBeenCalled();
    expect(routerNavigateSpy).toHaveBeenCalledTimes(1);
    expect(routerNavigateSpy).toHaveBeenCalledWith(['/forbidden']);
    expect(capturedError?.status).toBe(403);
  });

  it('d) Peticion a otra URL externa (https://external.example.com/data) → el header Authorization NO se envia', () => {
    // Simulamos un token activo en AuthService
    vi.spyOn(authService, 'getToken').mockReturnValue('super-secret-token');

    let responseReceived = false;
    httpClient.get('https://external.example.com/data').subscribe(() => {
      responseReceived = true;
    });

    const req = httpMock.expectOne('https://external.example.com/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
    expect(req.request.headers.has('X-Correlation-Id')).toBe(true);

    req.flush({ success: true });
    expect(responseReceived).toBe(true);
  });

  it('e) Peticion a endpoint interno de la API con sesion activa → envia Authorization Bearer y X-Correlation-Id', () => {
    const activeToken = 'enterprise-bearer-token-xyz';
    vi.spyOn(authService, 'getToken').mockReturnValue(activeToken);

    httpClient.get('https://api.nalunpos.com/api/v1/warehouses').subscribe();

    const req = httpMock.expectOne('https://api.nalunpos.com/api/v1/warehouses');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${activeToken}`);
    expect(req.request.headers.has('X-Correlation-Id')).toBe(true);

    req.flush([]);
  });
});
