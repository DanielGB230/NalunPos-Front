// =============================================================================
// Runtime AppConfig Token & Provider — @nalunpos/shared/data-access
// Carga validada de /config.json antes del bootstrap sin dependencias circulares.
// =============================================================================

import {
  Injectable,
  InjectionToken,
  provideAppInitializer,
  signal,
  inject,
  type Provider,
  type EnvironmentProviders,
  type Signal,
} from '@angular/core';
import type { AppConfig } from './app-config.interface';

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

/**
 * Valida que un objeto de configuración cumpla con el contrato AppConfig.
 * Rechaza el arranque si falta apiUrl o tiene un formato no válido.
 */
export function validateAppConfig(raw: unknown): AppConfig {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Configuración de runtime inválida: el contenido debe ser un objeto JSON.');
  }

  const candidate = raw as Record<string, unknown>;

  if (typeof candidate['apiUrl'] !== 'string' || candidate['apiUrl'].trim() === '') {
    throw new Error(
      'Configuración de runtime inválida: apiUrl es requerida y debe ser una cadena no vacía.',
    );
  }

  const trimmedUrl = candidate['apiUrl'].trim();
  const isValidUrl =
    trimmedUrl.startsWith('http://') ||
    trimmedUrl.startsWith('https://') ||
    trimmedUrl.startsWith('/');

  if (!isValidUrl) {
    throw new Error(
      `Configuración de runtime inválida: apiUrl "${trimmedUrl}" no es una URL válida (debe iniciar con http://, https:// o /).`,
    );
  }

  const appName = typeof candidate['appName'] === 'string' ? candidate['appName'] : 'NalunPos';
  const production = Boolean(candidate['production']);
  const features =
    typeof candidate['features'] === 'object' && candidate['features'] !== null
      ? (candidate['features'] as Record<string, boolean>)
      : undefined;

  return {
    apiUrl: trimmedUrl.replace(/\/$/, ''), // normalizar sin slash final
    appName,
    production,
    features,
  };
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private readonly _config = signal<AppConfig>({
    apiUrl: '',
    appName: 'NalunPos',
    production: false,
  });

  readonly config: Signal<AppConfig> = this._config.asReadonly();

  getConfig(): AppConfig {
    return this._config();
  }

  get apiUrl(): string {
    return this._config().apiUrl;
  }

  async loadConfig(configPath: string, fallback: AppConfig): Promise<AppConfig> {
    try {
      const response = await fetch(configPath, { cache: 'no-store' });
      if (!response.ok) {
        if (fallback.production) {
          throw new Error(
            `No se pudo cargar la configuración de producción desde ${configPath} (HTTP ${response.status}).`,
          );
        }
        const validatedFallback = validateAppConfig(fallback);
        this._config.set(validatedFallback);
        return validatedFallback;
      }

      const data: unknown = await response.json();
      const validated = validateAppConfig(data);
      this._config.set(validated);
      return validated;
    } catch (err) {
      if (fallback.production) {
        throw new Error(
          `Error crítico al cargar la configuración de runtime: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
      const validatedFallback = validateAppConfig(fallback);
      this._config.set(validatedFallback);
      return validatedFallback;
    }
  }
}

/**
 * Registra la carga asíncrona de /config.json mediante provideAppInitializer()
 * y expone APP_CONFIG fuertemente tipado en el inyector raíz de Angular.
 */
export function provideRuntimeConfig(
  defaultConfig: AppConfig,
  configPath = '/config.json',
): (Provider | EnvironmentProviders)[] {
  return [
    AppConfigService,
    {
      provide: APP_CONFIG,
      useFactory: (service: AppConfigService) => service.getConfig(),
      deps: [AppConfigService],
    },
    provideAppInitializer(async () => {
      const service = inject(AppConfigService);
      await service.loadConfig(configPath, defaultConfig);
    }),
  ];
}
