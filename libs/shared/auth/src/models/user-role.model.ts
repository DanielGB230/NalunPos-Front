// =============================================================================
// Modelo de Roles Canónicos — Contratos con el Backend NalunPos-Api
// Fuente: PlatformRoles / TenantRoles (ADR 0023 en NalunPos-Api)
// =============================================================================

export const PLATFORM_ROLES = ['SuperAdmin'] as const;

export const TENANT_ROLES = ['TenantAdmin', 'Supervisor', 'InventoryManager', 'Cajero'] as const;

export const USER_ROLES = [
  'SuperAdmin',
  'TenantAdmin',
  'Supervisor',
  'InventoryManager',
  'Cajero',
] as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];
export type TenantRole = (typeof TENANT_ROLES)[number];
export type UserRole = (typeof USER_ROLES)[number];

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (USER_ROLES as readonly string[]).includes(value);
}

export function isRoleTenantCoherent(role: UserRole, tenantId: string | null): boolean {
  if ((PLATFORM_ROLES as readonly string[]).includes(role)) {
    return tenantId === null;
  }

  if ((TENANT_ROLES as readonly string[]).includes(role)) {
    return typeof tenantId === 'string' && tenantId.trim().length > 0;
  }

  return false;
}
