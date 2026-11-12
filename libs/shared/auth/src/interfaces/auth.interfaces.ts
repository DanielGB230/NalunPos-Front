// =============================================================================
// DTOs de Autenticación — Contratos con el Backend NalunPos-Api
// Fuente: POST /api/v1/auth/login (LoginResponse)
// =============================================================================

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
