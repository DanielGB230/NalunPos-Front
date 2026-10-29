// =============================================================================
// authInterceptor.spec.ts — Unit Tests (Vitest)
// =============================================================================

import '@angular/compiler';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

// Mock de sessionStorage para entorno Node.js
const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

if (typeof globalThis.sessionStorage === 'undefined') {
  Object.defineProperty(globalThis, 'sessionStorage', { value: storageMock });
}

describe('authInterceptor', () => {
  let authServiceMock: { logout: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    sessionStorage.clear();
    authServiceMock = { logout: vi.fn() };
    routerMock = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('debe adjuntar el encabezado Authorization Bearer cuando existe token en sessionStorage', () => {
    const mockToken = 'jwt.test.token.12345';
    sessionStorage.setItem('nalunpos_token', mockToken);

    const req = new HttpRequest('GET', '/api/v1/test');
    let capturedReq: HttpRequest<unknown> | undefined;

    const nextFn = vi.fn((clonedReq: HttpRequest<unknown>) => {
      capturedReq = clonedReq;
      return of(new HttpResponse());
    });

    TestBed.runInInjectionContext(() => authInterceptor(req, nextFn).subscribe());

    expect(nextFn).toHaveBeenCalledOnce();
    expect(capturedReq?.headers.has('Authorization')).toBe(true);
    expect(capturedReq?.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
  });

  it('NO debe adjuntar el encabezado Authorization cuando sessionStorage esta vacio', () => {
    const req = new HttpRequest('GET', '/api/v1/test');
    let capturedReq: HttpRequest<unknown> | undefined;

    const nextFn = vi.fn((clonedReq: HttpRequest<unknown>) => {
      capturedReq = clonedReq;
      return of(new HttpResponse());
    });

    TestBed.runInInjectionContext(() => authInterceptor(req, nextFn).subscribe());

    expect(nextFn).toHaveBeenCalledOnce();
    expect(capturedReq?.headers.has('Authorization')).toBe(false);
  });

  it('debe invocar authService.logout() y router.navigate(["/login"]) ante error 401', () => {
    const req = new HttpRequest('GET', '/api/v1/protected');
    const httpError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const nextFn = vi.fn(() => throwError(() => httpError));

    let receivedError: unknown;
    TestBed.runInInjectionContext(() =>
      authInterceptor(req, nextFn).subscribe({
        error: (err) => {
          receivedError = err;
        },
      }),
    );

    expect(nextFn).toHaveBeenCalledOnce();
    expect(authServiceMock.logout).toHaveBeenCalledOnce();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    expect(receivedError).toBe(httpError);
  });

  it('debe invocar router.navigate(["/forbidden"]) ante error 403 sin llamar logout', () => {
    const req = new HttpRequest('GET', '/api/v1/admin-only');
    const httpError = new HttpErrorResponse({ status: 403, statusText: 'Forbidden' });
    const nextFn = vi.fn(() => throwError(() => httpError));

    let receivedError: unknown;
    TestBed.runInInjectionContext(() =>
      authInterceptor(req, nextFn).subscribe({
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

  it('NO debe redirigir ni cerrar sesion ante otros errores HTTP (ej. 500)', () => {
    const req = new HttpRequest('GET', '/api/v1/data');
    const httpError = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    const nextFn = vi.fn(() => throwError(() => httpError));

    let receivedError: unknown;
    TestBed.runInInjectionContext(() =>
      authInterceptor(req, nextFn).subscribe({
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

  it('debe propagar errores no-HttpErrorResponse sin alterar rutas ni sesion', () => {
    const req = new HttpRequest('GET', '/api/v1/data');
    const genericError = new Error('Network crash');
    const nextFn = vi.fn(() => throwError(() => genericError));

    let receivedError: unknown;
    TestBed.runInInjectionContext(() =>
      authInterceptor(req, nextFn).subscribe({
        error: (err) => {
          receivedError = err;
        },
      }),
    );

    expect(nextFn).toHaveBeenCalledOnce();
    expect(authServiceMock.logout).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(receivedError).toBe(genericError);
  });
});
