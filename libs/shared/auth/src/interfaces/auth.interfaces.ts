// =============================================================================
// DTOs de Autenticación — Contratos con el Backend NalunPos-Api
// Fuente: POST /api/v1/auth/login (LoginResponse)
// =============================================================================

import type { UserRole } from '../models/user-role.model';

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface AuthResponse {
  readonly token: string;
  readonly userId: string;
  readonly roleId: string;
  readonly role: string;
  readonly email: string;
  readonly fullName: string;
  readonly tenantId: string | null;
  readonly expiresAtUtc: string;
}

export interface StoredAuthSession {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
  readonly tenantId: string | null;
  readonly token: string;
  readonly expiresAt: string;
}
