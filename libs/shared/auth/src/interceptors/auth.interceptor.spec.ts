// =============================================================================
// authInterceptor.spec.ts — Unit Tests (Vitest)
// =============================================================================

import '@angular/compiler';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HttpRequest } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { of } from 'rxjs';

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
  beforeEach(() => {
    sessionStorage.clear();
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
      return of(null as any);
    });

    authInterceptor(req, nextFn);

    expect(nextFn).toHaveBeenCalledOnce();
    expect(capturedReq?.headers.has('Authorization')).toBe(true);
    expect(capturedReq?.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
  });

  it('NO debe adjuntar el encabezado Authorization cuando sessionStorage esta vacio', () => {
    const req = new HttpRequest('GET', '/api/v1/test');
    let capturedReq: HttpRequest<unknown> | undefined;

    const nextFn = vi.fn((clonedReq: HttpRequest<unknown>) => {
      capturedReq = clonedReq;
      return of(null as any);
    });

    authInterceptor(req, nextFn);

    expect(nextFn).toHaveBeenCalledOnce();
    expect(capturedReq?.headers.has('Authorization')).toBe(false);
  });
});
