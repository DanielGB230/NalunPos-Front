// =============================================================================
// AuthService — Librería Compartida: libs/shared/auth
// Responsabilidad: Estado de autenticación (Signal-First) + comunicación con el backend.
// ADR-0002: Signals nativos en lugar de NgRx.
// ADR-0003: Sesión y Token unificados en una sola clave en sessionStorage (Vigente Fase 0).
// ADR-0012: In-Memory Token + HttpOnly Refresh Cookie (Propuesto para Fase F1 Backend).
// =============================================================================

import { Injectable, computed, inject, signal, type Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs';
import type { AuthResponse, LoginRequest, UserRole } from '../interfaces/auth.interfaces';
import { UserSession } from '../models/user-session.model';

interface StoredAuthSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
  token: string;
  expiresAt: string;
}

const VALID_ROLES: readonly string[] = ['SuperAdmin', 'TenantAdmin', 'Cashier', 'Inventory'];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  /**
   * Única clave constante de persistencia para sesión y token unificados en sessionStorage.
   * Regla de arquitectura F0: Prohibido almacenar claves separadas para token y sesión.
   */
  private readonly STORAGE_KEY = 'nalunpos_auth_session';

  // ─── Estado de la sesión (Signal-First en memoria) ────────────────────────
  private readonly _currentUser = signal<UserSession | null>(this.restoreSessionFromStorage());

  readonly currentUser: Signal<UserSession | null> = this._currentUser.asReadonly();
  readonly isAuthenticated: Signal<boolean> = computed(() => {
    const user = this._currentUser();
    return user !== null && !user.isExpired;
  });
  readonly userRole: Signal<UserRole | null> = computed(() => this._currentUser()?.role ?? null);
  readonly tenantId: Signal<string | null> = computed(() => this._currentUser()?.tenantId ?? null);
  readonly token: Signal<string | null> = computed(() => this._currentUser()?.token ?? null);

  /**
   * Retorna el token de autenticación en memoria de la sesión activa, o null si no existe.
   * La fuente de verdad reactiva es el Signal en memoria.
   */
  getToken(): string | null {
    return this._currentUser()?.token ?? null;
  }

  private apiUrl = '';

  configureApiUrl(apiUrl: string): void {
    this.apiUrl = apiUrl;
  }

  // ─── Login ─────────────────────────────────────────────────────────────────
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/v1/auth/login`, credentials).pipe(
      tap((response) => {
        this.persistSession(response, credentials.email);
      }),
    );
  }

  // ─── Logout ────────────────────────────────────────────────────────────────
  logout(): void {
    this._currentUser.set(null);
    sessionStorage.removeItem(this.STORAGE_KEY);
    this.router.navigate(['/login']);
  }

  // ─── Privados ──────────────────────────────────────────────────────────────

  private persistSession(response: AuthResponse, fallbackEmail: string): void {
    const session = UserSession.fromAuthResponse(response, fallbackEmail);
    this._currentUser.set(session);

    const storedData: StoredAuthSession = {
      id: session.id,
      name: session.name,
      email: session.email,
      role: session.role,
      tenantId: session.tenantId,
      token: session.token,
      expiresAt: session.expiresAt.toISOString(),
    };

    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(storedData));
  }

  private restoreSessionFromStorage(): UserSession | null {
    try {
      const raw = sessionStorage.getItem(this.STORAGE_KEY);
      if (!raw) {
        return null;
      }

      const parsed: unknown = JSON.parse(raw);

      if (
        !parsed ||
        typeof parsed !== 'object' ||
        !('token' in parsed) ||
        typeof parsed.token !== 'string' ||
        parsed.token.trim() === '' ||
        !('id' in parsed) ||
        typeof parsed.id !== 'string' ||
        parsed.id.trim() === '' ||
        !('email' in parsed) ||
        typeof parsed.email !== 'string' ||
        parsed.email.trim() === '' ||
        !('role' in parsed) ||
        typeof parsed.role !== 'string' ||
        !VALID_ROLES.includes(parsed.role) ||
        !('expiresAt' in parsed) ||
        typeof parsed.expiresAt !== 'string'
      ) {
        sessionStorage.removeItem(this.STORAGE_KEY);
        return null;
      }

      const data = parsed as StoredAuthSession;
      const expiresAt = new Date(data.expiresAt);

      if (isNaN(expiresAt.getTime())) {
        sessionStorage.removeItem(this.STORAGE_KEY);
        return null;
      }

      const session = new UserSession(
        data.id,
        data.name ?? (data.role === 'SuperAdmin' ? 'SuperAdmin' : 'Usuario'),
        data.email,
        data.role,
        data.tenantId ?? null,
        data.token,
        expiresAt,
      );

      if (session.isExpired) {
        sessionStorage.removeItem(this.STORAGE_KEY);
        return null;
      }

      return session;
    } catch {
      sessionStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }
}
