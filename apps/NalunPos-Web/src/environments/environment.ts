// =============================================================================
// Environment: Desarrollo — NalunPos-Web
// Fallback local seguro cuando /config.json no se encuentra en desarrollo.
// =============================================================================

import type { AppConfig } from '@nalunpos/shared/data-access';

export const environment: AppConfig = {
  production: false,
  apiUrl: 'https://localhost:7232',
  appName: 'NalunPos — Panel Operativo',
};
