// =============================================================================
// SessionRefreshCoordinator — Coordinación del refresh de arranque
// Responsabilidad única: garantizar un solo refresh en vuelo por pestaña y
// serializar las llamadas entre pestañas con Web Locks. No toca estado de sesión.
// Si `navigator.locks` no existe, degrada a single-flight sin polyfill.
// =============================================================================

import { Injectable, inject } from '@angular/core';
import { defer, finalize, firstValueFrom, from, shareReplay, type Observable } from 'rxjs';
import type { AuthResponse } from '../interfaces/auth.interfaces';
import { AuthApiClient } from './auth-api.client';

const REFRESH_LOCK_NAME = 'nalunpos-session-refresh';

@Injectable({ providedIn: 'root' })
export class SessionRefreshCoordinator {
  private readonly authApi = inject(AuthApiClient);

  private inFlight$: Observable<AuthResponse> | null = null;

  refresh(): Observable<AuthResponse> {
    if (this.inFlight$) {
      return this.inFlight$;
    }

    const request$ = defer(() => this.refreshWithCrossTabLock()).pipe(
      finalize(() => {
        this.inFlight$ = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.inFlight$ = request$;
    return request$;
  }

  private refreshWithCrossTabLock(): Observable<AuthResponse> {
    const locks = this.resolveLockManager();
    if (!locks) {
      return this.authApi.refresh();
    }

    return from(locks.request(REFRESH_LOCK_NAME, () => firstValueFrom(this.authApi.refresh())));
  }

  private resolveLockManager(): LockManager | null {
    const candidate: unknown = typeof navigator === 'undefined' ? null : navigator.locks;
    if (typeof candidate !== 'object' || candidate === null) {
      return null;
    }

    const lockManager = candidate as { request?: unknown };
    return typeof lockManager.request === 'function' ? (candidate as LockManager) : null;
  }
}
