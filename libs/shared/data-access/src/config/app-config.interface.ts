// =============================================================================
// AppConfig Interface — @nalunpos/shared/data-access
// Contrato fuertemente tipado para la configuración en runtime de las aplicaciones.
// =============================================================================

export interface AppConfig {
  apiUrl: string;
  appName: string;
  production: boolean;
  features?: Record<string, boolean>;
}
