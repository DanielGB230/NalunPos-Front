// =============================================================================
// AuthApiClient — Cliente HTTP puro del contrato de autenticación
// Responsabilidad única: invocar login, refresh y logout del backend.
// Sin estado, sin storage, sin router. Las tres llamadas envían
// `withCredentials: true` para aceptar/enviar la cookie HttpOnly `nalunpos_rt`.
// =============================================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_CONFIG } from '@nalunpos/shared/data-access';
import type { Observable } from 'rxjs';
import type { AuthResponse, LoginRequest } from '../interfaces/auth.interfaces';

@Injectable({ providedIn: 'root' })
export class AuthApiClient {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.config.apiUrl}/api/v1/auth/login`, credentials, {
      withCredentials: true,
    });
  }

  refresh(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.config.apiUrl}/api/v1/auth/refresh`, null, {
      withCredentials: true,
    });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.config.apiUrl}/api/v1/auth/logout`, null, {
      withCredentials: true,
    });
  }
}
