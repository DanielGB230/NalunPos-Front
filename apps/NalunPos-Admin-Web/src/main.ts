// =============================================================================
// main.ts — NalunPos-Admin-Web
// Bootstrap: la configuración de runtime se carga y valida ANTES de crear la
// aplicación; APP_CONFIG se provee como valor ya resuelto (ADR 0009 / 0014).
// En producción, un fallo en /config.json rechaza este módulo y la aplicación
// nunca arranca (fail-closed). En desarrollo se usa el fallback de environment.
// =============================================================================

import { mergeApplicationConfig } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { APP_CONFIG, loadAppConfig } from '@nalunpos/shared/data-access';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';
import { environment } from './environments/environment';

const config = await loadAppConfig('/config.json', environment);

bootstrapApplication(
  AppComponent,
  mergeApplicationConfig(appConfig, {
    providers: [{ provide: APP_CONFIG, useValue: config }],
  }),
);
