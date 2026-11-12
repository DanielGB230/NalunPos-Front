import '@angular/compiler';
import { describe, it, expect, afterEach, vi } from 'vitest';
import type { AuthResponse } from '../interfaces/auth.interfaces';
import {
  TENANT_ROLES,
  USER_ROLES,
  isRoleTenantCoherent,
  isUserRole,
  type UserRole,
} from './user-role.model';
import { UserSession } from './user-session.model';

function createValidResponse(
  overrides: Partial<Record<keyof AuthResponse, unknown>> = {},
): AuthResponse {
  const base: Record<keyof AuthResponse, unknown> = {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid-jwt-token',
    userId: '01950000-0000-7000-8000-000000000001',
    roleId: '01950000-0000-7000-8000-000000000002',
    role: 'TenantAdmin',
    email: 'usuario@empresa.com',
    fullName: 'Usuario Prueba',
    tenantId: '01950000-0000-7000-8000-000000000099',
    expiresAtUtc: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };

  return { ...base, ...overrides } as AuthResponse;
}

describe('user-role.model', () => {
  it('debe reconocer exactamente los 5 roles canónicos del backend con isUserRole', () => {
    for (const role of USER_ROLES) {
      expect(isUserRole(role)).toBe(true);
    }
    expect(USER_ROLES).toEqual([
      'SuperAdmin',
      'TenantAdmin',
      'Supervisor',
      'InventoryManager',
      'Cajero',
    ]);
  });

  it('debe rechazar en isUserRole roles legacy, desconocidos o no string', () => {
    expect(isUserRole('Cashier')).toBe(false);
    expect(isUserRole('Inventory')).toBe(false);
    expect(isUserRole('User')).toBe(false);
    expect(isUserRole('Foo')).toBe(false);
    expect(isUserRole('')).toBe(false);
    expect(isUserRole(0)).toBe(false);
    expect(isUserRole(null)).toBe(false);
    expect(isUserRole(undefined)).toBe(false);
  });

  it('debe validar coherencia plataforma/tenant con isRoleTenantCoherent', () => {
    expect(isRoleTenantCoherent('SuperAdmin', null)).toBe(true);
    expect(isRoleTenantCoherent('SuperAdmin', 'tenant-01')).toBe(false);
    expect(isRoleTenantCoherent('SuperAdmin', '')).toBe(false);

    for (const role of TENANT_ROLES) {
      expect(isRoleTenantCoherent(role, 'tenant-01')).toBe(true);
      expect(isRoleTenantCoherent(role, null)).toBe(false);
      expect(isRoleTenantCoherent(role, '')).toBe(false);
      expect(isRoleTenantCoherent(role, '   ')).toBe(false);
    }
  });
});

describe('UserSession.fromAuthResponse (política fail-closed)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  // ─── Casos válidos: los 5 roles canónicos con tenantId coherente ──────────

  it('debe aceptar SuperAdmin con tenantId null y asignarlo como usuario de plataforma', () => {
    const response = createValidResponse({
      role: 'SuperAdmin',
      tenantId: null,
      email: 'super@nalunpos.com',
      fullName: 'Super Administrador',
    });

    const session = UserSession.fromAuthResponse(response);

    expect(session).not.toBeNull();
    expect(session?.role).toBe('SuperAdmin');
    expect(session?.tenantId).toBeNull();
    expect(session?.isSuperAdmin).toBe(true);
    expect(session?.id).toBe(response.userId);
    expect(session?.email).toBe('super@nalunpos.com');
    expect(session?.name).toBe('Super Administrador');
    expect(session?.token).toBe(response.token);
  });

  it.each<UserRole>(['TenantAdmin', 'Supervisor', 'InventoryManager', 'Cajero'])(
    'debe aceptar el rol canónico de tenant "%s" con tenantId válido no vacío',
    (tenantRole) => {
      const response = createValidResponse({
        role: tenantRole,
        tenantId: '01950000-0000-7000-8000-000000000123',
      });

      const session = UserSession.fromAuthResponse(response);

      expect(session).not.toBeNull();
      expect(session?.role).toBe(tenantRole);
      expect(session?.tenantId).toBe('01950000-0000-7000-8000-000000000123');
      expect(session?.isSuperAdmin).toBe(false);
    },
  );

  // ─── Fallback cosmético de fullName hacia email ───────────────────────────

  it.each([undefined, '', '   '])(
    'debe usar email como name cuando fullName es cosméticamente "%s", conservando el rol sin elevar privilegios',
    (emptyName) => {
      const response = createValidResponse({
        role: 'Cajero',
        email: 'cajero@empresa.com',
        fullName: emptyName,
      });

      const session = UserSession.fromAuthResponse(response);

      expect(session).not.toBeNull();
      expect(session?.name).toBe('cajero@empresa.com');
      expect(session?.role).toBe('Cajero');
      expect(session?.isSuperAdmin).toBe(false);
    },
  );

  // ─── Rechazos por rol inválido / desconocido / numérico / ausente ─────────

  it.each<unknown>([
    'Cashier',
    'Inventory',
    'User',
    'Foo',
    '',
    '   ',
    ' SuperAdmin ',
    0,
    1,
    2,
    3,
    null,
    undefined,
  ])('debe retornar null (fail-closed) cuando role es "%s"', (invalidRole) => {
    const response = createValidResponse({ role: invalidRole });
    expect(UserSession.fromAuthResponse(response)).toBeNull();
  });

  // ─── Rechazos por incoherencia rol / tenantId ─────────────────────────────

  it('debe retornar null cuando SuperAdmin viene con tenantId no nulo', () => {
    const response = createValidResponse({
      role: 'SuperAdmin',
      tenantId: '01950000-0000-7000-8000-000000000099',
    });

    expect(UserSession.fromAuthResponse(response)).toBeNull();
  });

  it.each<unknown>(['', '   ', undefined])(
    'debe retornar null cuando SuperAdmin viene con tenantId "%s" en vez de null',
    (invalidPlatformTenantId) => {
      const response = createValidResponse({
        role: 'SuperAdmin',
        tenantId: invalidPlatformTenantId,
      });

      expect(UserSession.fromAuthResponse(response)).toBeNull();
    },
  );

  it.each<UserRole>(['TenantAdmin', 'Supervisor', 'InventoryManager', 'Cajero'])(
    'debe retornar null cuando el rol de tenant "%s" viene con tenantId null',
    (tenantRole) => {
      const response = createValidResponse({
        role: tenantRole,
        tenantId: null,
      });

      expect(UserSession.fromAuthResponse(response)).toBeNull();
    },
  );

  it.each<UserRole>(['TenantAdmin', 'Supervisor', 'InventoryManager', 'Cajero'])(
    'debe retornar null cuando el rol de tenant "%s" viene con tenantId vacío o en blanco',
    (tenantRole) => {
      expect(
        UserSession.fromAuthResponse(createValidResponse({ role: tenantRole, tenantId: '' })),
      ).toBeNull();
      expect(
        UserSession.fromAuthResponse(createValidResponse({ role: tenantRole, tenantId: '   ' })),
      ).toBeNull();
    },
  );

  // ─── Rechazos por expiración inválida, ausente o vencida ──────────────────

  it.each<unknown>([undefined, null, '', '   ', 'no-es-una-fecha-iso'])(
    'debe retornar null cuando expiresAtUtc es "%s"',
    (badDate) => {
      const response = createValidResponse({ expiresAtUtc: badDate });
      expect(UserSession.fromAuthResponse(response)).toBeNull();
    },
  );

  it('debe retornar null cuando expiresAtUtc ya venció en el pasado', () => {
    const expiredIso = new Date(Date.now() - 1000).toISOString();
    const response = createValidResponse({ expiresAtUtc: expiredIso });

    expect(UserSession.fromAuthResponse(response)).toBeNull();
  });

  it('debe retornar null cuando expiresAtUtc es exactamente igual al instante actual (<= Date.now())', () => {
    const fixedNow = new Date('2026-11-11T18:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);

    const response = createValidResponse({ expiresAtUtc: fixedNow.toISOString() });
    expect(UserSession.fromAuthResponse(response)).toBeNull();
  });

  // ─── Rechazos por campos obligatorios faltantes o vacíos ──────────────────

  it.each<unknown>([undefined, null, '', '   '])(
    'debe retornar null cuando token es "%s"',
    (badToken) => {
      const response = createValidResponse({ token: badToken });
      expect(UserSession.fromAuthResponse(response)).toBeNull();
    },
  );

  it.each<unknown>([undefined, null, '', '   '])(
    'debe retornar null cuando userId es "%s"',
    (badUserId) => {
      const response = createValidResponse({ userId: badUserId });
      expect(UserSession.fromAuthResponse(response)).toBeNull();
    },
  );

  it.each<unknown>([undefined, null, '', '   '])(
    'debe retornar null cuando email es "%s"',
    (badEmail) => {
      const response = createValidResponse({ email: badEmail });
      expect(UserSession.fromAuthResponse(response)).toBeNull();
    },
  );
});
