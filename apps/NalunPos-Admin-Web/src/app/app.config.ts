// =============================================================================
// app.config.ts — NalunPos-Admin-Web
// Configuración central para el panel SuperAdmin (bootstrap).
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
import { authInterceptor, AuthService } from '@nalunpos/shared/auth';
import {
  APP_CONFIG,
  correlationIdInterceptor,
  errorInterceptor,
  provideRuntimeConfig,
} from '@nalunpos/shared/data-access';
import { APP_NAV_CONFIG, AUTH_GATEWAY, LOGIN_CONFIG } from '@nalunpos/shared/util';
import { ADMIN_NAV_CONFIG } from './core/config/nav.config';
import { ADMIN_LOGIN_CONFIG } from './core/config/login.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideBrowserGlobalErrorListeners(),

    // Carga de configuración validada en runtime (/config.json con fallback a environment)
    provideRuntimeConfig(environment),

    // Sincronización de AuthService con la URL en runtime
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      const config = inject(APP_CONFIG);
      authService.configureApiUrl(config.apiUrl);
    }),

    provideRouter(appRoutes, withViewTransitions(), withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withInterceptors([correlationIdInterceptor, authInterceptor, errorInterceptor]),
    ),
    // Configuración compartida de Layout, Navegación y Autenticación
    { provide: APP_NAV_CONFIG, useValue: ADMIN_NAV_CONFIG },
    { provide: LOGIN_CONFIG, useValue: ADMIN_LOGIN_CONFIG },
    { provide: AUTH_GATEWAY, useExisting: AuthService },
  ],
};
