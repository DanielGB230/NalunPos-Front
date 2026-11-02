// =============================================================================
// authTokenInterceptor.spec.ts — Unit Tests (Vitest)
// Responsabilidad única: Verificar la inyección segura del token Bearer,
// la comparación determinista de orígenes (URL.origin) y la protección
// contra colisiones de prefijo de dominio, subdominios, puertos y URLs relativas al protocolo.
// =============================================================================

import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { APP_CONFIG, type AppConfig } from '@nalunpos/shared/data-access';
import { authTokenInterceptor, isAuthorizedApiRequest } from './auth-token.interceptor';
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

  describe('Casos Positivos (Inyección Autorizada de Token)', () => {
    it('debe adjuntar el header Authorization: Bearer cuando la URL es relativa (/api/v1/warehouses) en el mismo origen', () => {
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

    it('debe adjuntar el header Authorization cuando la URL coincide con el origen exacto de APP_CONFIG.apiUrl (https://api.nalunpos.com/api/v1/tenants)', () => {
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
      expect(capturedReq?.headers.has('Authorization')).toBe(true);
      expect(capturedReq?.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    });
  });

  describe('Casos Negativos de Seguridad (Mitigación Estricta de Fuga de Credenciales)', () => {
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

    it('NO debe adjuntar token ante colisión de prefijo de dominio (https://api.nalunpos.com.evil.io/api/v1/warehouses)', () => {
      authServiceMock.getToken.mockReturnValue('secret-jwt-token');

      const req = new HttpRequest('GET', 'https://api.nalunpos.com.evil.io/api/v1/warehouses');
      let capturedReq: HttpRequest<unknown> | undefined;

      const nextFn = vi.fn((clonedReq: HttpRequest<unknown>) => {
        capturedReq = clonedReq;
        return of(new HttpResponse());
      });

      TestBed.runInInjectionContext(() => authTokenInterceptor(req, nextFn).subscribe());

      expect(nextFn).toHaveBeenCalledOnce();
      expect(capturedReq?.headers.has('Authorization')).toBe(false);
    });

    it('NO debe adjuntar token hacia dominio externo con /api/ (https://evil.io/api/v1/warehouses)', () => {
      authServiceMock.getToken.mockReturnValue('secret-jwt-token');

      const req = new HttpRequest('GET', 'https://evil.io/api/v1/warehouses');
      let capturedReq: HttpRequest<unknown> | undefined;

      const nextFn = vi.fn((clonedReq: HttpRequest<unknown>) => {
        capturedReq = clonedReq;
        return of(new HttpResponse());
      });

      TestBed.runInInjectionContext(() => authTokenInterceptor(req, nextFn).subscribe());

      expect(nextFn).toHaveBeenCalledOnce();
      expect(capturedReq?.headers.has('Authorization')).toBe(false);
    });

    it('NO debe adjuntar token ante protocol-relative URL hacia dominio externo (//evil.io/api/v1/warehouses)', () => {
      authServiceMock.getToken.mockReturnValue('secret-jwt-token');

      const req = new HttpRequest('GET', '//evil.io/api/v1/warehouses');
      let capturedReq: HttpRequest<unknown> | undefined;

      const nextFn = vi.fn((clonedReq: HttpRequest<unknown>) => {
        capturedReq = clonedReq;
        return of(new HttpResponse());
      });

      TestBed.runInInjectionContext(() => authTokenInterceptor(req, nextFn).subscribe());

      expect(nextFn).toHaveBeenCalledOnce();
      expect(capturedReq?.headers.has('Authorization')).toBe(false);
    });

    it('NO debe adjuntar token ante subdominio distinto (https://sub.api.nalunpos.com/api/v1/warehouses)', () => {
      authServiceMock.getToken.mockReturnValue('secret-jwt-token');

      const req = new HttpRequest('GET', 'https://sub.api.nalunpos.com/api/v1/warehouses');
      let capturedReq: HttpRequest<unknown> | undefined;

      const nextFn = vi.fn((clonedReq: HttpRequest<unknown>) => {
        capturedReq = clonedReq;
        return of(new HttpResponse());
      });

      TestBed.runInInjectionContext(() => authTokenInterceptor(req, nextFn).subscribe());

      expect(nextFn).toHaveBeenCalledOnce();
      expect(capturedReq?.headers.has('Authorization')).toBe(false);
    });

    it('NO debe adjuntar token ante puerto distinto (https://api.nalunpos.com:8443/api/v1/warehouses)', () => {
      authServiceMock.getToken.mockReturnValue('secret-jwt-token');

      const req = new HttpRequest('GET', 'https://api.nalunpos.com:8443/api/v1/warehouses');
      let capturedReq: HttpRequest<unknown> | undefined;

      const nextFn = vi.fn((clonedReq: HttpRequest<unknown>) => {
        capturedReq = clonedReq;
        return of(new HttpResponse());
      });

      TestBed.runInInjectionContext(() => authTokenInterceptor(req, nextFn).subscribe());

      expect(nextFn).toHaveBeenCalledOnce();
      expect(capturedReq?.headers.has('Authorization')).toBe(false);
    });

    it('NO debe adjuntar token hacia URLs con rutas no API (https://api.nalunpos.com/static/logo.png)', () => {
      authServiceMock.getToken.mockReturnValue('secret-jwt-token');

      const req = new HttpRequest('GET', 'https://api.nalunpos.com/static/logo.png');
      let capturedReq: HttpRequest<unknown> | undefined;

      const nextFn = vi.fn((clonedReq: HttpRequest<unknown>) => {
        capturedReq = clonedReq;
        return of(new HttpResponse());
      });

      TestBed.runInInjectionContext(() => authTokenInterceptor(req, nextFn).subscribe());

      expect(nextFn).toHaveBeenCalledOnce();
      expect(capturedReq?.headers.has('Authorization')).toBe(false);
    });

    it('NO debe adjuntar token ante URLs malformadas que provoquen excepción en parser URL', () => {
      authServiceMock.getToken.mockReturnValue('secret-jwt-token');

      const req = new HttpRequest('GET', 'http://[::1:invalid-port-format');
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

  describe('isAuthorizedApiRequest (Validación Determinista Unitaria)', () => {
    const baseUri = 'http://localhost:4200/';
    const configuredApiUrl = 'https://api.nalunpos.com';

    it('retorna true para ruta relativa /api/ en el mismo origen', () => {
      expect(isAuthorizedApiRequest('/api/v1/products', baseUri, configuredApiUrl)).toBe(true);
    });

    it('retorna true para mismo origen de configuredApiUrl', () => {
      expect(
        isAuthorizedApiRequest(
          'https://api.nalunpos.com/api/v1/products',
          baseUri,
          configuredApiUrl,
        ),
      ).toBe(true);
    });

    it('retorna true si configuredApiUrl incluye path base específico (ej. /api/v1)', () => {
      expect(
        isAuthorizedApiRequest(
          'https://api.nalunpos.com/api/v1/products',
          baseUri,
          'https://api.nalunpos.com/api/v1',
        ),
      ).toBe(true);
    });

    it('retorna false si el path no coincide con la base configurada', () => {
      expect(
        isAuthorizedApiRequest(
          'https://api.nalunpos.com/v2/products',
          baseUri,
          'https://api.nalunpos.com/api/v1',
        ),
      ).toBe(false);
    });

    it('retorna false para URL malformada', () => {
      expect(isAuthorizedApiRequest('http://[invalid', baseUri, configuredApiUrl)).toBe(false);
    });

    it('retorna false para baseURI inválida', () => {
      expect(isAuthorizedApiRequest('/api/v1/products', 'invalid-base-uri', configuredApiUrl)).toBe(
        false,
      );
    });

    it('retorna false si configuredApiUrl es inválida y la petición no es del mismo origen', () => {
      expect(
        isAuthorizedApiRequest(
          'https://other.com/api/v1/products',
          baseUri,
          'http://[invalid-config-url',
        ),
      ).toBe(false);
    });
  });
});
