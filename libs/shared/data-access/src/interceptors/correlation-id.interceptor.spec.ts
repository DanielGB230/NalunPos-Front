// =============================================================================
// correlationIdInterceptor.spec.ts — Unit Tests (Vitest)
// =============================================================================

import '@angular/compiler';
import { describe, it, expect, vi } from 'vitest';
import { HttpRequest } from '@angular/common/http';
import { correlationIdInterceptor } from './correlation-id.interceptor';
import { of } from 'rxjs';

describe('correlationIdInterceptor', () => {
  it('debe inyectar un encabezado X-Correlation-Id no vacío en cada petición HTTP saliente', () => {
    const req = new HttpRequest('GET', '/api/v1/ping');
    let capturedReq: HttpRequest<any> | undefined;

    const nextFn = vi.fn((clonedReq) => {
      capturedReq = clonedReq;
      return of({} as any);
    });

    correlationIdInterceptor(req, nextFn);

    expect(nextFn).toHaveBeenCalledOnce();
    expect(capturedReq?.headers.has('X-Correlation-Id')).toBe(true);
    const correlationId = capturedReq?.headers.get('X-Correlation-Id');
    expect(correlationId).toBeTruthy();
    expect(typeof correlationId).toBe('string');
  });
});
