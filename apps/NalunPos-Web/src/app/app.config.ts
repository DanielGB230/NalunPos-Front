// =============================================================================
// app.config.ts — NalunPos-Web
// Configuración central de la aplicación (bootstrap).
// Registra: Router, HttpClient, Interceptores, Signal Forms, Runtime AppConfig.
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
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { appRoutes } from './app.routes';
import { environment } from '../environments/environment';
import {
  authTokenInterceptor,
  sessionExpiredInterceptor,
  AuthService,
} from '@nalunpos/shared/auth';
import {
  APP_CONFIG,
  correlationIdInterceptor,
  errorInterceptor,
  provideRuntimeConfig,
} from '@nalunpos/shared/data-access';
import { APP_NAV_CONFIG, AUTH_GATEWAY, LOGIN_CONFIG } from '@nalunpos/shared/util';
import { WEB_NAV_CONFIG } from './core/config/nav.config';
import { WEB_LOGIN_CONFIG } from './core/config/login.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    // Error handling global
    provideBrowserGlobalErrorListeners(),

    // Carga de configuración validada en runtime (/config.json con fallback a environment)
    provideRuntimeConfig(environment),

    // Sincronización de AuthService con la URL en runtime
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      const config = inject(APP_CONFIG);
      authService.configureApiUrl(config.apiUrl);
    }),

    // Router con View Transitions API y binding de inputs en rutas
    provideRouter(appRoutes, withViewTransitions(), withComponentInputBinding()),

    // HTTP Client con Fetch API + interceptores funcionales (orden estricto)
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
    { provide: APP_NAV_CONFIG, useValue: WEB_NAV_CONFIG },
    { provide: LOGIN_CONFIG, useValue: WEB_LOGIN_CONFIG },
    { provide: AUTH_GATEWAY, useExisting: AuthService },
  ],
};
