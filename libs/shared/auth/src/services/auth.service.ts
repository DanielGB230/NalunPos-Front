// =============================================================================
// AuthService — Librería Compartida: libs/shared/auth
// Responsabilidad: Estado de autenticación (Signal-First) + comunicación con el backend.
// ADR-0002: Signals nativos en lugar de NgRx.
// ADR-0003: Token en sessionStorage (nunca localStorage).
// =============================================================================

import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import type { AuthResponse, LoginRequest } from '../interfaces/auth.interfaces';
import { UserSession } from '../models/user-session.model';

const SESSION_STORAGE_KEY = 'nalunpos_session';
const TOKEN_STORAGE_KEY = 'nalunpos_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // ─── Estado de la sesión (Signal-First) ────────────────────────────────────
  private readonly _currentUser = signal<UserSession | null>(
    this.restoreSessionFromStorage(),
  );

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => {
    const user = this._currentUser();
    return user !== null && !user.isExpired;
  });
  readonly userRole = computed(() => this._currentUser()?.role ?? null);
  readonly tenantId = computed(() => this._currentUser()?.tenantId ?? null);

  private apiUrl = '';

  configureApiUrl(apiUrl: string): void {
    this.apiUrl = apiUrl;
  }

  // ─── Login ─────────────────────────────────────────────────────────────────
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/api/v1/auth/login`, credentials)
      .pipe(tap((response) => this.persistSession(response, credentials.email)));
  }

  // ─── Logout ────────────────────────────────────────────────────────────────
  logout(): void {
    this._currentUser.set(null);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    this.router.navigate(['/login']);
  }

  // ─── Privados ──────────────────────────────────────────────────────────────

  private persistSession(response: AuthResponse, fallbackEmail: string): void {
    const session = UserSession.fromAuthResponse(response, fallbackEmail);
    this._currentUser.set(session);

    // ADR-0003: sessionStorage — token y sesión guardados independientemente
    sessionStorage.setItem(TOKEN_STORAGE_KEY, session.token);
    sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
        tenantId: session.tenantId,
        token: session.token,
        expiresAt: session.expiresAt.toISOString(),
      }),
    );
  }

  private restoreSessionFromStorage(): UserSession | null {
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;

      const data = JSON.parse(raw) as {
        id: string;
        name: string;
        email: string;
        role: import('../interfaces/auth.interfaces').UserRole;
        tenantId: string | null;
        token: string;
        expiresAt: string;
      };

      const session = new UserSession(
        data.id,
        data.name,
        data.email,
        data.role,
        data.tenantId,
        data.token,
        new Date(data.expiresAt),
      );

      if (session.isExpired) {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        return null;
      }

      return session;
    } catch {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }
  }
}
