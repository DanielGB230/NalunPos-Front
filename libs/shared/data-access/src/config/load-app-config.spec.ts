// =============================================================================
// load-app-config.spec.ts — @nalunpos/shared/data-access
// Carga de /config.json: validación, normalización y fail-closed en producción.
// =============================================================================

import { describe, it, expect, vi, afterEach } from 'vitest';
import type { AppConfig } from './app-config.interface';
import { loadAppConfig } from './load-app-config';

describe('loadAppConfig', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('debe cargar configuración válida con HTTP 200 OK y normalizarla', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        apiUrl: 'https://api.nalunpos.com/',
        appName: 'NalunPos-Prod',
        production: true,
      }),
    } as Response;

    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const fallback: AppConfig = {
      apiUrl: 'http://localhost:5000',
      appName: 'NalunPos',
      production: false,
    };

    const config = await loadAppConfig('/config.json', fallback);

    expect(config.apiUrl).toBe('https://api.nalunpos.com');
    expect(config.appName).toBe('NalunPos-Prod');
    expect(config.production).toBe(true);
  });

  it('debe rechazar con fail-fast en producción ante respuesta HTTP 404', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
    } as Response;

    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const prodFallback: AppConfig = {
      apiUrl: 'https://api.nalunpos.com',
      appName: 'NalunPos',
      production: true,
    };

    await expect(loadAppConfig('/config.json', prodFallback)).rejects.toThrow(
      /No se pudo cargar la configuración de producción desde \/config\.json \(HTTP 404\)/,
    );
  });

  it('debe rechazar con fail-fast en producción si fetch lanza error de red', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error: connection refused'));

    const prodFallback: AppConfig = {
      apiUrl: 'https://api.nalunpos.com',
      appName: 'NalunPos',
      production: true,
    };

    await expect(loadAppConfig('/config.json', prodFallback)).rejects.toThrow(
      /Error crítico al cargar la configuración de runtime: Network error/,
    );
  });

  it('debe rechazar con fail-fast en producción si el JSON retornado es inválido', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        apiUrl: '', // Inválida
        appName: 'NalunPos',
        production: true,
      }),
    } as Response;

    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const prodFallback: AppConfig = {
      apiUrl: 'https://api.nalunpos.com',
      appName: 'NalunPos',
      production: true,
    };

    await expect(loadAppConfig('/config.json', prodFallback)).rejects.toThrow(
      /Error crítico al cargar la configuración de runtime:/,
    );
  });

  it('debe usar fallback validado en entorno de desarrollo ante respuesta HTTP 404', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
    } as Response;

    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const devFallback: AppConfig = {
      apiUrl: 'http://localhost:5000/',
      appName: 'NalunPos-Dev',
      production: false,
    };

    const config = await loadAppConfig('/config.json', devFallback);

    expect(config.apiUrl).toBe('http://localhost:5000');
    expect(config.appName).toBe('NalunPos-Dev');
    expect(config.production).toBe(false);
  });

  it('debe usar fallback validado en entorno de desarrollo si fetch lanza error de red', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Fetch failed'));

    const devFallback: AppConfig = {
      apiUrl: 'http://localhost:7232/',
      appName: 'NalunPos-Local',
      production: false,
    };

    const config = await loadAppConfig('/config.json', devFallback);

    expect(config.apiUrl).toBe('http://localhost:7232');
    expect(config.production).toBe(false);
    expect(config.appName).toBe('NalunPos-Local');
  });
});
