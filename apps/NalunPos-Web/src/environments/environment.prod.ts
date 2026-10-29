// =============================================================================
// Environment: Producción — NalunPos-Web
// Cero URLs o puertos hardcodeados en bundle compilado (ADR-0008 / F0-7).
// La URL del backend es provista en runtime mediante /config.json.
// =============================================================================

import type { AppConfig } from '@nalunpos/shared/data-access';

export const environment: AppConfig = {
  production: true,
  apiUrl: '', // Provista en runtime vía /config.json
  appName: 'NalunPos — Panel Operativo',
};
