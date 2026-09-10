// =============================================================================
// DTOs de Autenticación — Contratos con el Backend NalunPos-Api
// Fuente: POST /api/v1/auth/login
// =============================================================================

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface AuthResponse {
  readonly token: string;
  readonly expiresAtUtc?: string;
  readonly expiresIn?: number;
  readonly userId?: string;
  readonly role?: number | UserRole;
  readonly tenantId?: string | null;
  readonly user?: AuthUserDto;
}

export interface AuthUserDto {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
  readonly tenantId: string | null;
}

export type UserRole =
  | 'SuperAdmin'
  | 'TenantAdmin'
  | 'Cashier'
  | 'Inventory';
