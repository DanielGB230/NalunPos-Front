// =============================================================================
// loadAppConfig — @nalunpos/shared/data-access
// Carga y valida /config.json ANTES del bootstrap, sin estado mutable.
// Producción: fail-closed (rechaza y el arranque no ocurre).
// Desarrollo: fallback validado al environment de la aplicación.
// =============================================================================

import type { AppConfig } from './app-config.interface';
import { validateAppConfig } from './validate-app-config';

/**
 * Resuelve la configuración de runtime de forma atómica: o devuelve un AppConfig
 * ya validado, o rechaza la promesa. Nunca expone un valor parcial ni por defecto.
 */
export async function loadAppConfig(configPath: string, fallback: AppConfig): Promise<AppConfig> {
  try {
    const response = await fetch(configPath, { cache: 'no-store' });
    if (!response.ok) {
      if (fallback.production) {
        throw new Error(
          `No se pudo cargar la configuración de producción desde ${configPath} (HTTP ${response.status}).`,
        );
      }
      return validateAppConfig(fallback);
    }

    const data: unknown = await response.json();
    return validateAppConfig(data);
  } catch (err) {
    if (fallback.production) {
      throw new Error(
        `Error crítico al cargar la configuración de runtime: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
    return validateAppConfig(fallback);
  }
}
