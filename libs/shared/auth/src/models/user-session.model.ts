// =============================================================================
// Modelo de Dominio Frontend: UserSession
// Entidad interna que representa la sesión activa del usuario.
// Política Fail-Closed: cualquier respuesta o payload almacenado incompleto,
// expirado, con rol no canónico o con incoherencia rol/tenantId retorna null.
// =============================================================================

import type { AuthResponse, StoredAuthSession } from '../interfaces/auth.interfaces';
import {
  isNonEmptyIdentifier,
  isRoleTenantCoherent,
  isUserRole,
  type UserRole,
} from './user-role.model';

export class UserSession {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly role: UserRole,
    public readonly tenantId: string | null,
    public readonly token: string,
    public readonly expiresAt: Date,
  ) {}

  get isExpired(): boolean {
    return Date.now() >= this.expiresAt.getTime();
  }

  get isSuperAdmin(): boolean {
    return this.role === 'SuperAdmin' && this.tenantId === null;
  }

  toStoredSession(): StoredAuthSession {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      tenantId: this.tenantId,
      token: this.token,
      expiresAt: this.expiresAt.toISOString(),
    };
  }

  /**
   * Crea una instancia validada de UserSession a partir de LoginResponse (Pos.Api).
   * Falla cerrado (retorna null) si falta algún campo requerido, la fecha es inválida/vencida,
   * el rol no es canónico, hay Guid.Empty o existe incoherencia entre el rol y el tenantId.
   */
  static fromAuthResponse(response: AuthResponse): UserSession | null {
    if (!response || typeof response !== 'object') {
      return null;
    }

    return UserSession.validateAndCreate({
      token: response.token,
      id: response.userId,
      email: response.email,
      role: response.role,
      tenantId: response.tenantId,
      expiresAt: response.expiresAtUtc,
      name: response.fullName,
    });
  }

  /**
   * Reconstruye y valida una UserSession desde el objeto deserializado de sessionStorage.
   * Reutiliza exactamente la misma política fail-closed que fromAuthResponse.
   */
  static fromStoredSession(raw: unknown): UserSession | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }

    const record = raw as Record<string, unknown>;
    return UserSession.validateAndCreate({
      token: record['token'],
      id: record['id'],
      email: record['email'],
      role: record['role'],
      tenantId: record['tenantId'],
      expiresAt: record['expiresAt'],
      name: record['name'],
    });
  }

  private static validateAndCreate(candidate: {
    readonly token: unknown;
    readonly id: unknown;
    readonly email: unknown;
    readonly role: unknown;
    readonly tenantId: unknown;
    readonly expiresAt: unknown;
    readonly name: unknown;
  }): UserSession | null {
    if (
      typeof candidate.token !== 'string' ||
      candidate.token.trim().length === 0 ||
      !isNonEmptyIdentifier(candidate.id) ||
      typeof candidate.email !== 'string' ||
      candidate.email.trim().length === 0 ||
      !isUserRole(candidate.role)
    ) {
      return null;
    }

    if (typeof candidate.expiresAt !== 'string' || candidate.expiresAt.trim().length === 0) {
      return null;
    }

    const parsedTimestamp = Date.parse(candidate.expiresAt);
    if (Number.isNaN(parsedTimestamp) || parsedTimestamp <= Date.now()) {
      return null;
    }

    if (candidate.tenantId !== null && typeof candidate.tenantId !== 'string') {
      return null;
    }

    const normalizedTenantId: string | null =
      candidate.tenantId === null ? null : candidate.tenantId.trim();

    if (!isRoleTenantCoherent(candidate.role, normalizedTenantId)) {
      return null;
    }

    const normalizedEmail = candidate.email.trim();
    const resolvedName =
      typeof candidate.name === 'string' && candidate.name.trim().length > 0
        ? candidate.name.trim()
        : normalizedEmail;

    return new UserSession(
      candidate.id.trim(),
      resolvedName,
      normalizedEmail,
      candidate.role,
      normalizedTenantId,
      candidate.token.trim(),
      new Date(parsedTimestamp),
    );
  }
}
