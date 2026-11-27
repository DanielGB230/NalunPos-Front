import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import type { AppError } from '@nalunpos/shared/data-access';
import { extractHttpStatus, isAnonymousAuthEndpoint } from './session-http.helpers';

describe('isAnonymousAuthEndpoint', () => {
  it('debe reconocer login, refresh y logout con ruta relativa', () => {
    expect(isAnonymousAuthEndpoint('/api/v1/auth/login')).toBe(true);
    expect(isAnonymousAuthEndpoint('/api/v1/auth/refresh')).toBe(true);
    expect(isAnonymousAuthEndpoint('/api/v1/auth/logout')).toBe(true);
  });

  it('debe reconocer login, refresh y logout con host absoluto', () => {
    expect(isAnonymousAuthEndpoint('https://api.nalunpos.com/api/v1/auth/login')).toBe(true);
    expect(isAnonymousAuthEndpoint('https://api.nalunpos.com/api/v1/auth/refresh')).toBe(true);
    expect(isAnonymousAuthEndpoint('https://api.nalunpos.com/api/v1/auth/logout')).toBe(true);
  });

  it('debe tolerar query string en las tres rutas anónimas', () => {
    expect(isAnonymousAuthEndpoint('/api/v1/auth/login?returnUrl=%2Fdashboard')).toBe(true);
    expect(isAnonymousAuthEndpoint('https://api.nalunpos.com/api/v1/auth/refresh?force=true')).toBe(
      true,
    );
    expect(isAnonymousAuthEndpoint('/api/v1/auth/logout?reason=manual')).toBe(true);
  });

  it('NO debe clasificar /auth/me como endpoint anónimo (es protegido)', () => {
    expect(isAnonymousAuthEndpoint('/api/v1/auth/me')).toBe(false);
    expect(isAnonymousAuthEndpoint('https://api.nalunpos.com/api/v1/auth/me')).toBe(false);
  });

  it('NO debe clasificar prefijos o rutas distintas como endpoint anónimo', () => {
    expect(isAnonymousAuthEndpoint('/api/v1/auth/loginx')).toBe(false);
    expect(isAnonymousAuthEndpoint('/api/v1/authz/login')).toBe(false);
    expect(isAnonymousAuthEndpoint('/api/v1/warehouses')).toBe(false);
    expect(isAnonymousAuthEndpoint('https://api.nalunpos.com/api/v1/auth/refresh-delayed')).toBe(
      false,
    );
  });

  it('NO debe clasificar una URL sin segmento /auth como endpoint anónimo', () => {
    expect(isAnonymousAuthEndpoint('/api/v1/products/login')).toBe(false);
    expect(isAnonymousAuthEndpoint('login')).toBe(false);
  });
});

describe('extractHttpStatus', () => {
  it('debe extraer el status de un HttpErrorResponse', () => {
    const error = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });

    expect(extractHttpStatus(error)).toBe(401);
  });

  it('debe extraer el status de un AppError estructurado', () => {
    const error: AppError = {
      code: 'FORBIDDEN',
      message: 'Sin permisos',
      status: 403,
    };

    expect(extractHttpStatus(error)).toBe(403);
  });

  it('debe retornar null para un objeto sin status', () => {
    expect(extractHttpStatus({ code: 'UNKNOWN' })).toBeNull();
  });

  it('debe retornar null cuando el status no es numérico', () => {
    expect(extractHttpStatus({ status: '401' })).toBeNull();
  });

  it('debe retornar null para null, undefined y errores no estructurados', () => {
    expect(extractHttpStatus(null)).toBeNull();
    expect(extractHttpStatus(undefined)).toBeNull();
    expect(extractHttpStatus(new Error('Conexión perdida'))).toBeNull();
  });
});
