// =============================================================================
// AuthService — Librería Compartida: libs/shared/auth
// Responsabilidad: estado de autenticación (Signal-First) y orquestación del
// ciclo de sesión contra AuthApiClient. La sesión vive SOLO en memoria.
// ADR-0002: Signals nativos en lugar de NgRx.
// ADR-0012: Access token en memoria + refresh token en cookie HttpOnly.
// =============================================================================

import { Injectable, computed, inject, signal, type Signal } from '@angular/core';
import { Router } from '@angular/router';
import type { AppError } from '@nalunpos/shared/data-access';
import { EMPTY, catchError, map, of, switchMap, tap, throwError, type Observable } from 'rxjs';
import type { AuthResponse, LoginRequest } from '../interfaces/auth.interfaces';
import type { UserRole } from '../models/user-role.model';
import { UserSession } from '../models/user-session.model';
import { AuthApiClient } from './auth-api.client';
import { SessionRefreshCoordinator } from './session-refresh.coordinator';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authApi = inject(AuthApiClient);
  private readonly sessionRefresh = inject(SessionRefreshCoordinator);
  private readonly router = inject(Router);

  // ─── Estado de la sesión (Signal-First, solo memoria) ─────────────────────
  private readonly _currentUser = signal<UserSession | null>(null);

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

  // ─── Login ─────────────────────────────────────────────────────────────────
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.authApi.login(credentials).pipe(
      switchMap((response) => {
        const session = UserSession.fromAuthResponse(response);
        if (!session) {
          return throwError(() => this.createInvalidSessionError());
        }

        this._currentUser.set(session);
        return of(response);
      }),
    );
  }

  // ─── Inicialización de sesión al arranque ──────────────────────────────────
  initializeSession(): Observable<void> {
    return this.sessionRefresh.refresh().pipe(
      map((response) => UserSession.fromAuthResponse(response)),
      tap((session) => this._currentUser.set(session)),
      map(() => undefined),
      catchError(() => {
        this._currentUser.set(null);
        return of(undefined);
      }),
    );
  }

  // ─── Logout ────────────────────────────────────────────────────────────────
  logout(): void {
    this._currentUser.set(null);
    this.router.navigate(['/login']);
    this.authApi
      .logout()
      .pipe(catchError(() => EMPTY))
      .subscribe();
  }

  // ─── Privados ──────────────────────────────────────────────────────────────
  private createInvalidSessionError(): AppError {
    return {
      code: 'AUTH_INVALID_SESSION',
      message: 'No fue posible iniciar sesión. Verifica tus credenciales e intenta de nuevo.',
      status: 401,
    };
  }
}
