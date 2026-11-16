// =============================================================================
// validateAppConfig — @nalunpos/shared/data-access
// Validación y normalización determinista del contrato AppConfig.
// =============================================================================

import type { AppConfig } from './app-config.interface';

/**
 * Valida que un objeto de configuración cumpla con el contrato AppConfig.
 * Rechaza el arranque si falta apiUrl o tiene un formato no válido.
 */
export function validateAppConfig(raw: unknown): AppConfig {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error('Configuración de runtime inválida: el contenido debe ser un objeto JSON.');
  }

  const candidate = raw as Record<string, unknown>;

  if (typeof candidate['apiUrl'] !== 'string' || candidate['apiUrl'].trim() === '') {
    throw new Error(
      'Configuración de runtime inválida: apiUrl es requerida y debe ser una cadena no vacía.',
    );
  }

  const trimmedUrl = candidate['apiUrl'].trim();

  if (trimmedUrl.startsWith('//')) {
    throw new Error(
      `Configuración de runtime inválida: apiUrl "${trimmedUrl}" no puede ser una URL relativa al protocolo (//).`,
    );
  }

  let normalizedUrl: string;

  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    try {
      const parsed = new URL(trimmedUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('Protocolo inválido');
      }
      if (!parsed.hostname) {
        throw new Error('Hostname ausente');
      }
    } catch {
      throw new Error(
        `Configuración de runtime inválida: apiUrl "${trimmedUrl}" no es una URL válida (esquema http/https malformado).`,
      );
    }
    normalizedUrl = trimmedUrl.replace(/\/+$/, '');
  } else if (trimmedUrl.startsWith('/')) {
    normalizedUrl = trimmedUrl.length > 1 ? trimmedUrl.replace(/\/+$/, '') : '/';
  } else {
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
    apiUrl: normalizedUrl,
    appName,
    production,
    features,
  };
}
