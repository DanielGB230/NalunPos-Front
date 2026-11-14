// =============================================================================
// auth-openapi-contract.test-d.ts
// Verificación estática y de contrato en tiempo de pruebas de tipos entre las interfaces
// manuales del frontend y los esquemas tipados generados desde OpenAPI v1.
// =============================================================================

import { describe, it, expectTypeOf } from 'vitest';
import type { AuthResponse, LoginRequest } from './auth.interfaces';
import type { components, paths } from '@nalunpos/shared/data-access';

describe('Contrato OpenAPI v1 ↔ DTOs de Autenticación y Almacenes', () => {
  type OpenApiLoginResponse = components['schemas']['LoginResponse'];
  type OpenApiLoginRequest = components['schemas']['LoginRequest'];
  type OpenApiWarehouseDto = components['schemas']['WarehouseDto'];
  type OpenApiCreateWarehouseRequest = components['schemas']['CreateWarehouseRequest'];

  it('debe coincidir el contrato de LoginRequest con el schema OpenAPI v1', () => {
    // Verificación bidireccional de compatibilidad de tipos con toExtend
    expectTypeOf<LoginRequest>().toExtend<OpenApiLoginRequest>();
    expectTypeOf<OpenApiLoginRequest>().toExtend<LoginRequest>();
  });

  it('debe coincidir el contrato de AuthResponse con el schema LoginResponse de OpenAPI v1', () => {
    // OpenApiLoginResponse asignable a AuthResponse (DTO inmutable en frontend)
    expectTypeOf<OpenApiLoginResponse>().toExtend<AuthResponse>();

    // Verificación de propiedades requeridas y tipos exactos
    expectTypeOf<AuthResponse['token']>().toEqualTypeOf<OpenApiLoginResponse['token']>();
    expectTypeOf<AuthResponse['userId']>().toEqualTypeOf<OpenApiLoginResponse['userId']>();
    expectTypeOf<AuthResponse['roleId']>().toEqualTypeOf<OpenApiLoginResponse['roleId']>();
    expectTypeOf<AuthResponse['role']>().toEqualTypeOf<OpenApiLoginResponse['role']>();
    expectTypeOf<AuthResponse['email']>().toEqualTypeOf<OpenApiLoginResponse['email']>();
    expectTypeOf<AuthResponse['fullName']>().toEqualTypeOf<OpenApiLoginResponse['fullName']>();
    expectTypeOf<AuthResponse['tenantId']>().toEqualTypeOf<OpenApiLoginResponse['tenantId']>();
    expectTypeOf<AuthResponse['expiresAtUtc']>().toEqualTypeOf<
      OpenApiLoginResponse['expiresAtUtc']
    >();
  });

  it('debe coincidir la respuesta 200 de POST /api/v1/auth/login con el schema LoginResponse', () => {
    type PathLoginResponse =
      paths['/api/v1/auth/login']['post']['responses'][200]['content']['application/json'];
    expectTypeOf<PathLoginResponse>().toEqualTypeOf<OpenApiLoginResponse>();
    expectTypeOf<PathLoginResponse>().toExtend<AuthResponse>();
  });

  it('debe garantizar que WarehouseDto existe en OpenAPI v1 con las propiedades canónicas requeridas', () => {
    expectTypeOf<OpenApiWarehouseDto>().toHaveProperty('id');
    expectTypeOf<OpenApiWarehouseDto>().toHaveProperty('name');
    expectTypeOf<OpenApiWarehouseDto>().toHaveProperty('branchId');
    expectTypeOf<OpenApiWarehouseDto>().toHaveProperty('description');
    expectTypeOf<OpenApiWarehouseDto>().toHaveProperty('isActive');
    expectTypeOf<OpenApiWarehouseDto>().toHaveProperty('isDefault');
    expectTypeOf<OpenApiWarehouseDto>().toHaveProperty('createdAtUtc');

    expectTypeOf<OpenApiWarehouseDto['id']>().toBeString();
    expectTypeOf<OpenApiWarehouseDto['name']>().toBeString();
    expectTypeOf<OpenApiWarehouseDto['branchId']>().toBeString();
    expectTypeOf<OpenApiWarehouseDto['isActive']>().toBeBoolean();
    expectTypeOf<OpenApiWarehouseDto['isDefault']>().toBeBoolean();
  });

  it('debe garantizar que CreateWarehouseRequest existe en OpenAPI v1 con las propiedades requeridas', () => {
    expectTypeOf<OpenApiCreateWarehouseRequest>().toHaveProperty('name');
    expectTypeOf<OpenApiCreateWarehouseRequest>().toHaveProperty('branchId');
    expectTypeOf<OpenApiCreateWarehouseRequest>().toHaveProperty('description');
    expectTypeOf<OpenApiCreateWarehouseRequest>().toHaveProperty('isDefault');

    expectTypeOf<OpenApiCreateWarehouseRequest['name']>().toBeString();
    expectTypeOf<OpenApiCreateWarehouseRequest['branchId']>().toBeString();
    expectTypeOf<OpenApiCreateWarehouseRequest['isDefault']>().toBeBoolean();
  });
});
