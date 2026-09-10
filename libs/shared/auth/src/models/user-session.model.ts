// =============================================================================
// Modelo de Dominio Frontend: UserSession
// Entidad interna que representa la sesión activa del usuario.
// Derivada de AuthResponse pero orientada al estado del frontend.
// =============================================================================

import type { AuthResponse, UserRole } from '../interfaces/auth.interfaces';

export class UserSession {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly role: UserRole,
    public readonly tenantId: string | null,
    public readonly token: string,
    public readonly expiresAt: Date,
  ) {}

  get isExpired(): boolean {
    return new Date() >= this.expiresAt;
  }

  get isSuperAdmin(): boolean {
    return this.role === 'SuperAdmin';
  }

  /**
   * Crea una instancia de UserSession mapeando la respuesta del backend Pos.Api.
   */
  static fromAuthResponse(response: AuthResponse, fallbackEmail: string = ''): UserSession {
    const token = response.token;

    let expiresAt: Date;
    if (response.expiresAtUtc) {
      expiresAt = new Date(response.expiresAtUtc);
    } else if (response.expiresIn) {
      expiresAt = new Date(Date.now() + response.expiresIn * 1000);
    } else {
      expiresAt = new Date(Date.now() + 3600 * 1000);
    }

    let role: UserRole = 'SuperAdmin';
    const rawRole = response.user?.role ?? response.role;
    if (rawRole === 0 || rawRole === 'SuperAdmin') role = 'SuperAdmin';
    else if (rawRole === 1 || rawRole === 'TenantAdmin') role = 'TenantAdmin';
    else if (rawRole === 2 || rawRole === 'Cashier') role = 'Cashier';
    else if (rawRole === 3 || rawRole === 'Inventory') role = 'Inventory';

    const id = response.user?.id ?? response.userId ?? 'user-id';
    const name = response.user?.name ?? (role === 'SuperAdmin' ? 'SuperAdmin' : 'Usuario');
    const email = response.user?.email ?? fallbackEmail;
    const tenantId = response.user?.tenantId ?? response.tenantId ?? null;

    return new UserSession(id, name, email, role, tenantId, token, expiresAt);
  }
}
