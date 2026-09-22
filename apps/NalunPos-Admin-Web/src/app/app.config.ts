// =============================================================================
// app.config.ts — NalunPos-Admin-Web
// Configuración idéntica a NalunPos-Web pero para el panel SuperAdmin.
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

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

function initializeAuth(authService: AuthService): () => void {
  return () => authService.configureApiUrl(environment.apiUrl);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      appRoutes,
      withViewTransitions(),
      withComponentInputBinding(),
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        correlationIdInterceptor,
        authInterceptor,
        errorInterceptor,
      ]),
    ),
    provideSignalFormsConfig({}),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true,
    },
  ],
};
