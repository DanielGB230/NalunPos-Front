// =============================================================================
// validate-app-config.spec.ts — @nalunpos/shared/data-access
// Validación y normalización determinista del contrato AppConfig.
// =============================================================================

import { describe, it, expect } from 'vitest';
import { validateAppConfig } from './validate-app-config';

describe('validateAppConfig', () => {
  describe('Validación de estructura y tipo objeto', () => {
    it('debe rechazar null', () => {
      expect(() => validateAppConfig(null)).toThrow(
        'Configuración de runtime inválida: el contenido debe ser un objeto JSON.',
      );
    });

    it('debe rechazar undefined', () => {
      expect(() => validateAppConfig(undefined)).toThrow(
        'Configuración de runtime inválida: el contenido debe ser un objeto JSON.',
      );
    });

    it('debe rechazar tipos primitivos (string, number, boolean)', () => {
      expect(() => validateAppConfig('https://api.nalunpos.com')).toThrow(
        'Configuración de runtime inválida: el contenido debe ser un objeto JSON.',
      );
      expect(() => validateAppConfig(42)).toThrow(
        'Configuración de runtime inválida: el contenido debe ser un objeto JSON.',
      );
      expect(() => validateAppConfig(true)).toThrow(
        'Configuración de runtime inválida: el contenido debe ser un objeto JSON.',
      );
    });

    it('debe rechazar arrays explícitamente', () => {
      expect(() => validateAppConfig([])).toThrow(
        'Configuración de runtime inválida: el contenido debe ser un objeto JSON.',
      );
      expect(() => validateAppConfig([{ apiUrl: 'https://api.nalunpos.com' }])).toThrow(
        'Configuración de runtime inválida: el contenido debe ser un objeto JSON.',
      );
    });
  });

  describe('Validación de apiUrl obligatoria y no vacía', () => {
    it('debe rechazar si apiUrl no está presente', () => {
      expect(() => validateAppConfig({})).toThrow(
        'Configuración de runtime inválida: apiUrl es requerida y debe ser una cadena no vacía.',
      );
    });

    it('debe rechazar si apiUrl no es string', () => {
      expect(() => validateAppConfig({ apiUrl: 12345 })).toThrow(
        'Configuración de runtime inválida: apiUrl es requerida y debe ser una cadena no vacía.',
      );
      expect(() => validateAppConfig({ apiUrl: null })).toThrow(
        'Configuración de runtime inválida: apiUrl es requerida y debe ser una cadena no vacía.',
      );
    });

    it('debe rechazar si apiUrl está vacía o contiene solo espacios en blanco', () => {
      expect(() => validateAppConfig({ apiUrl: '' })).toThrow(
        'Configuración de runtime inválida: apiUrl es requerida y debe ser una cadena no vacía.',
      );
      expect(() => validateAppConfig({ apiUrl: '    ' })).toThrow(
        'Configuración de runtime inválida: apiUrl es requerida y debe ser una cadena no vacía.',
      );
    });
  });

  describe('Validación de esquemas y URLs válidas', () => {
    it('debe rechazar esquemas no http/https (ej. ftp://, ws://, javascript:)', () => {
      expect(() => validateAppConfig({ apiUrl: 'ftp://files.nalunpos.com/api' })).toThrow(
        'no es una URL válida (debe iniciar con http://, https:// o /)',
      );
      expect(() => validateAppConfig({ apiUrl: 'ws://realtime.nalunpos.com' })).toThrow(
        'no es una URL válida (debe iniciar con http://, https:// o /)',
      );
      expect(() => validateAppConfig({ apiUrl: 'javascript:alert(1)' })).toThrow(
        'no es una URL válida (debe iniciar con http://, https:// o /)',
      );
    });

    it('debe rechazar URLs relativas al protocolo (//)', () => {
      expect(() => validateAppConfig({ apiUrl: '//evil.com/api' })).toThrow(
        'no puede ser una URL relativa al protocolo (//)',
      );
    });

    it('debe rechazar cadenas malformadas sin esquema ni barra inicial', () => {
      expect(() => validateAppConfig({ apiUrl: 'invalid-domain-without-protocol' })).toThrow(
        'no es una URL válida (debe iniciar con http://, https:// o /)',
      );
    });

    it('debe rechazar URLs malformadas que inician con http:// o https:// pero no son parseables', () => {
      expect(() => validateAppConfig({ apiUrl: 'https://' })).toThrow(
        'no es una URL válida (esquema http/https malformado)',
      );
      expect(() => validateAppConfig({ apiUrl: 'http://' })).toThrow(
        'no es una URL válida (esquema http/https malformado)',
      );
      expect(() => validateAppConfig({ apiUrl: 'https://[invalid-ipv6' })).toThrow(
        'no es una URL válida (esquema http/https malformado)',
      );
    });
  });

  describe('Normalización de apiUrl y valores por defecto', () => {
    it('debe normalizar el slash final en URLs absolutas https', () => {
      const config = validateAppConfig({ apiUrl: 'https://api.nalunpos.com/' });
      expect(config.apiUrl).toBe('https://api.nalunpos.com');
    });

    it('debe normalizar múltiples slashes finales en URLs absolutas', () => {
      const config = validateAppConfig({ apiUrl: 'https://api.nalunpos.com///' });
      expect(config.apiUrl).toBe('https://api.nalunpos.com');
    });

    it('debe normalizar el slash final en URLs absolutas http de desarrollo con puerto', () => {
      const config = validateAppConfig({ apiUrl: 'http://localhost:5000/' });
      expect(config.apiUrl).toBe('http://localhost:5000');
    });

    it('debe normalizar el slash final en rutas relativas (/api/)', () => {
      const config = validateAppConfig({ apiUrl: '/api/' });
      expect(config.apiUrl).toBe('/api');
    });

    it('debe mantener la barra solitaria / si la ruta relativa es solo /', () => {
      const config = validateAppConfig({ apiUrl: '/' });
      expect(config.apiUrl).toBe('/');
    });

    it('debe asignar appName por defecto "NalunPos" si no se proporciona', () => {
      const config = validateAppConfig({ apiUrl: 'https://api.nalunpos.com' });
      expect(config.appName).toBe('NalunPos');
    });

    it('debe respetar appName personalizado si se proporciona', () => {
      const config = validateAppConfig({
        apiUrl: 'https://api.nalunpos.com',
        appName: 'NalunPos-Enterprise',
      });
      expect(config.appName).toBe('NalunPos-Enterprise');
    });

    it('debe asignar production: false por defecto si no es booleano verdadero', () => {
      const config = validateAppConfig({ apiUrl: 'https://api.nalunpos.com' });
      expect(config.production).toBe(false);
    });

    it('debe respetar production: true si se define', () => {
      const config = validateAppConfig({
        apiUrl: 'https://api.nalunpos.com',
        production: true,
      });
      expect(config.production).toBe(true);
    });

    it('debe propagar el mapa features si se proporciona como objeto', () => {
      const config = validateAppConfig({
        apiUrl: 'https://api.nalunpos.com',
        features: { advancedReports: true, darkTheme: false },
      });
      expect(config.features).toEqual({ advancedReports: true, darkTheme: false });
    });

    it('debe ignorar features si no es un objeto válido', () => {
      const config = validateAppConfig({
        apiUrl: 'https://api.nalunpos.com',
        features: 'invalid-features' as unknown,
      });
      expect(config.features).toBeUndefined();

      const configNull = validateAppConfig({
        apiUrl: 'https://api.nalunpos.com',
        features: null as unknown,
      });
      expect(configNull.features).toBeUndefined();
    });
  });
});
