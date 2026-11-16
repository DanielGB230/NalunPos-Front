// =============================================================================
// tenant-contract.test-d.ts
// Verificación estática y de contrato en tiempo de pruebas de tipos entre el
// modelo de Tenants del frontend y el schema generado desde OpenAPI v1.
// =============================================================================

import { describe, it, expectTypeOf } from 'vitest';
import type { TenantDto, TenantStatus } from './tenant.model';
import type { components, paths } from '@nalunpos/shared/data-access';

describe('Contrato OpenAPI v1 ↔ TenantDto y TenantStatus', () => {
  type OpenApiTenantDto = components['schemas']['TenantDto'];
  type OpenApiTenantStatus = components['schemas']['TenantStatus'];

  it('debe coincidir el contrato de TenantDto con el schema OpenAPI v1', () => {
    expectTypeOf<TenantDto>().toEqualTypeOf<OpenApiTenantDto>();
    expectTypeOf<TenantDto>().toHaveProperty('id');
    expectTypeOf<TenantDto>().toHaveProperty('name');
    expectTypeOf<TenantDto>().toHaveProperty('documentNumber');
    expectTypeOf<TenantDto>().toHaveProperty('status');
    expectTypeOf<TenantDto>().toHaveProperty('createdAtUtc');
    expectTypeOf<TenantDto['status']>().toEqualTypeOf<OpenApiTenantStatus>();
  });

  it('debe coincidir el enum TenantStatus con los valores canónicos del backend', () => {
    expectTypeOf<TenantStatus>().toEqualTypeOf<'PendingProvisioning' | 'Active' | 'Suspended'>();
  });

  it('debe garantizar que GET /api/v1/platform/tenants retorne PagedResultOfTenantDto con items TenantDto', () => {
    type GetTenantsResponse =
      paths['/api/v1/platform/tenants']['get']['responses'][200]['content']['application/json'];
    expectTypeOf<GetTenantsResponse['items']>().toEqualTypeOf<OpenApiTenantDto[]>();
  });
});
