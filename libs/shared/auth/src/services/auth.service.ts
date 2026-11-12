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
import type { AppError } from '@nalunpos/shared/data-access';
import type { Observable } from 'rxjs';
import { of, switchMap, throwError } from 'rxjs';
import type { AuthResponse, LoginRequest } from '../interfaces/auth.interfaces';
import type { UserRole } from '../models/user-role.model';
import { UserSession } from '../models/user-session.model';

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
      switchMap((response) => {
        const session = UserSession.fromAuthResponse(response);
        if (!session) {
          const invalidSessionError: AppError = {
            code: 'AUTH_INVALID_SESSION',
            message: 'No fue posible iniciar sesión. Verifica tus credenciales e intenta de nuevo.',
            status: 401,
          };
          return throwError(() => invalidSessionError);
        }

        this.persistSession(session);
        return of(response);
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

  private persistSession(session: UserSession): void {
    this._currentUser.set(session);
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(session.toStoredSession()));
  }

  private restoreSessionFromStorage(): UserSession | null {
    try {
      const raw = sessionStorage.getItem(this.STORAGE_KEY);
      if (!raw) {
        return null;
      }

      const parsed: unknown = JSON.parse(raw);
      const session = UserSession.fromStoredSession(parsed);
      if (!session) {
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
