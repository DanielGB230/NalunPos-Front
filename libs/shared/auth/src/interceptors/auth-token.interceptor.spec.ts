// =============================================================================
// authTokenInterceptor.spec.ts — Unit Tests (Vitest)
// Responsabilidad única: Verificar la inyección segura del token Bearer
// y la protección contra fugas a dominios externos.
// =============================================================================

import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { APP_CONFIG, type AppConfig } from '@nalunpos/shared/data-access';
import { authTokenInterceptor } from './auth-token.interceptor';
import { AuthService } from '../services/auth.service';

describe('authTokenInterceptor', () => {
  let authServiceMock: { getToken: ReturnType<typeof vi.fn> };
  const mockConfig: AppConfig = {
    apiUrl: 'https://api.nalunpos.com',
    appName: 'NalunPos Enterprise',
    production: false,
  };

  beforeEach(() => {
    authServiceMock = {
      getToken: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: APP_CONFIG, useValue: mockConfig },
      ],
    });
  });

  it('debe adjuntar el header Authorization: Bearer cuando existe token en AuthService y la URL es relativa /api/', () => {
    const mockToken = 'mock-jwt-token-alpha';
    authServiceMock.getToken.mockReturnValue(mockToken);

    const req = new HttpRequest('GET', '/api/v1/warehouses');
    let capturedReq: HttpRequest<unknown> | undefined;

    const nextFn = vi.fn((clonedReq: HttpRequest<unknown>) => {
      capturedReq = clonedReq;
      return of(new HttpResponse());
    });

    TestBed.runInInjectionContext(() => authTokenInterceptor(req, nextFn).subscribe());

    expect(authServiceMock.getToken).toHaveBeenCalledOnce();
    expect(nextFn).toHaveBeenCalledOnce();
    expect(capturedReq?.headers.has('Authorization')).toBe(true);
    expect(capturedReq?.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
  });

  it('debe adjuntar el header Authorization cuando la URL coincide con APP_CONFIG.apiUrl', () => {
    const mockToken = 'mock-jwt-token-beta';
    authServiceMock.getToken.mockReturnValue(mockToken);

    const req = new HttpRequest('GET', 'https://api.nalunpos.com/api/v1/tenants');
    let capturedReq: HttpRequest<unknown> | undefined;

    const nextFn = vi.fn((clonedReq: HttpRequest<unknown>) => {
      capturedReq = clonedReq;
      return of(new HttpResponse());
    });

    TestBed.runInInjectionContext(() => authTokenInterceptor(req, nextFn).subscribe());

    expect(nextFn).toHaveBeenCalledOnce();
    expect(capturedReq?.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
  });

  it('NO debe adjuntar header Authorization si AuthService.getToken() retorna null', () => {
    authServiceMock.getToken.mockReturnValue(null);

    const req = new HttpRequest('GET', '/api/v1/warehouses');
    let capturedReq: HttpRequest<unknown> | undefined;

    const nextFn = vi.fn((clonedReq: HttpRequest<unknown>) => {
      capturedReq = clonedReq;
      return of(new HttpResponse());
    });

    TestBed.runInInjectionContext(() => authTokenInterceptor(req, nextFn).subscribe());

    expect(nextFn).toHaveBeenCalledOnce();
    expect(capturedReq?.headers.has('Authorization')).toBe(false);
  });

  it('NO debe adjuntar header Authorization hacia URLs absolutas externas de terceros', () => {
    const mockToken = 'mock-jwt-token-secret';
    authServiceMock.getToken.mockReturnValue(mockToken);

    const req = new HttpRequest('GET', 'https://external.example.com/data');
    let capturedReq: HttpRequest<unknown> | undefined;

    const nextFn = vi.fn((clonedReq: HttpRequest<unknown>) => {
      capturedReq = clonedReq;
      return of(new HttpResponse());
    });

    TestBed.runInInjectionContext(() => authTokenInterceptor(req, nextFn).subscribe());

    expect(nextFn).toHaveBeenCalledOnce();
    expect(capturedReq?.headers.has('Authorization')).toBe(false);
  });

  it('NO debe adjuntar header Authorization hacia URLs externas aunque contengan /api/ en el path', () => {
    const mockToken = 'mock-jwt-token-secret';
    authServiceMock.getToken.mockReturnValue(mockToken);

    const req = new HttpRequest('GET', 'https://thirdparty.analytics.com/api/telemetry');
    let capturedReq: HttpRequest<unknown> | undefined;

    const nextFn = vi.fn((clonedReq: HttpRequest<unknown>) => {
      capturedReq = clonedReq;
      return of(new HttpResponse());
    });

    TestBed.runInInjectionContext(() => authTokenInterceptor(req, nextFn).subscribe());

    expect(nextFn).toHaveBeenCalledOnce();
    expect(capturedReq?.headers.has('Authorization')).toBe(false);
  });

  it('prohibido acceder directamente a sessionStorage en el interceptor', () => {
    const storageSpy = vi.spyOn(sessionStorage, 'getItem');
    authServiceMock.getToken.mockReturnValue('valid-token');

    const req = new HttpRequest('GET', '/api/v1/warehouses');
    const nextFn = vi.fn(() => of(new HttpResponse()));

    TestBed.runInInjectionContext(() => authTokenInterceptor(req, nextFn).subscribe());

    expect(storageSpy).not.toHaveBeenCalled();
    storageSpy.mockRestore();
  });
});
