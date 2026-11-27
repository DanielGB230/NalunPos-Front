// =============================================================================
// app.config.ts — NalunPos-Admin-Web
// Configuración central para el panel SuperAdmin (bootstrap).
// Registra: Router, HttpClient, Interceptores, Signal Forms.
// La configuración de runtime (APP_CONFIG) se provee ya resuelta en main.ts.
// =============================================================================

import type { ApplicationConfig } from '@angular/core';
import {
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { appRoutes } from './app.routes';
import {
  authTokenInterceptor,
  sessionExpiredInterceptor,
  AuthService,
} from '@nalunpos/shared/auth';
import { correlationIdInterceptor, errorInterceptor } from '@nalunpos/shared/data-access';
import { APP_NAV_CONFIG, AUTH_GATEWAY, LOGIN_CONFIG } from '@nalunpos/shared/util';
import { ADMIN_NAV_CONFIG } from './core/config/nav.config';
import { ADMIN_LOGIN_CONFIG } from './core/config/login.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),

    provideRouter(appRoutes, withViewTransitions(), withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        correlationIdInterceptor, // 1° — Agrega X-Correlation-Id
        authTokenInterceptor, // 2° — Agrega Authorization: Bearer <token>
        sessionExpiredInterceptor, // 3° — Maneja respuestas 401 (logout/login) y 403 (/forbidden)
        errorInterceptor, // 4° — Traduce HttpErrorResponse → AppError
      ]),
    ),
    // Configuración compartida de Layout, Navegación y Autenticación
    { provide: APP_NAV_CONFIG, useValue: ADMIN_NAV_CONFIG },
    { provide: LOGIN_CONFIG, useValue: ADMIN_LOGIN_CONFIG },
    { provide: AUTH_GATEWAY, useExisting: AuthService },

    // Refresh de arranque: restaura la sesión en memoria desde la cookie HttpOnly.
    // Nunca bloquea el arranque si falla (initializeSession completa sin lanzar).
    provideAppInitializer(() => inject(AuthService).initializeSession()),
  ],
};
