// =============================================================================
// app.config.ts — NalunPos-Web
// Configuración central de la aplicación (bootstrap).
// Registra: Router, HttpClient, Interceptores, Signal Forms, CORS para dev.
// =============================================================================

import {
  APP_INITIALIZER,
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
} from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
  withFetch,
} from '@angular/common/http';
import { provideSignalFormsConfig } from '@angular/forms/signals';
import { appRoutes } from './app.routes';
import { environment } from '../environments/environment';
import {
  authInterceptor,
  AuthService,
} from '@nalunpos/shared/auth';
import {
  correlationIdInterceptor,
  errorInterceptor,
} from '@nalunpos/shared/data-access';

/**
 * Inicializa el AuthService con la URL del backend desde el environment.
 * Garantiza que la URL esté disponible antes del primer request HTTP.
 */
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

function initializeAuth(authService: AuthService): () => void {
  return () => authService.configureApiUrl(environment.apiUrl);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    // Error handling global
    provideBrowserGlobalErrorListeners(),

    // Router con View Transitions API y binding de inputs en rutas
    provideRouter(
      appRoutes,
      withViewTransitions(),
      withComponentInputBinding(),
    ),

    // HTTP Client con Fetch API + interceptores funcionales (orden importa)
    provideHttpClient(
      withFetch(),
      withInterceptors([
        correlationIdInterceptor, // 1° — agrega X-Correlation-Id
        authInterceptor,          // 2° — agrega Authorization: Bearer
        errorInterceptor,         // 3° — traduce errores HTTP → AppError
      ]),
    ),

    // Signal Forms
    provideSignalFormsConfig({}),

    // Inicialización del AuthService con la URL del backend
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true,
    },
  ],
};
