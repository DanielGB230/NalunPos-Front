// =============================================================================
// app-config-bootstrap.spec.ts — @nalunpos/shared/data-access
// Garantía: ningún consumidor puede leer APP_CONFIG antes de que la
// configuración de runtime esté cargada y validada.
// =============================================================================

import '@angular/compiler';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ApplicationInitStatus, inject, provideAppInitializer } from '@angular/core';
import type { AppConfig } from './app-config.interface';
import { APP_CONFIG } from './app-config.token';
import { loadAppConfig } from './load-app-config';

const DEV_FALLBACK: AppConfig = {
  apiUrl: 'https://fallback.test',
  appName: 'NalunPos',
  production: false,
};

const PRODUCTION_FALLBACK: AppConfig = {
  apiUrl: 'https://api.production',
  appName: 'NalunPos',
  production: true,
};

describe('Bootstrap de configuración de runtime', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('un consumidor debe observar el apiUrl ya cargado desde /config.json', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ apiUrl: 'https://api.test', appName: 'NalunPos', production: false }),
    } as Response);

    // La configuración se resuelve antes de configurar la aplicación.
    const config = await loadAppConfig('/config.json', DEV_FALLBACK);

    let observedApiUrl: string | null = null;

    TestBed.configureTestingModule({
      providers: [
        { provide: APP_CONFIG, useValue: config },
        provideAppInitializer(() => {
          observedApiUrl = inject(APP_CONFIG).apiUrl;
        }),
      ],
    });

    const initStatus = TestBed.inject(ApplicationInitStatus);
    await initStatus.donePromise;

    expect(observedApiUrl).toBe('https://api.test');
  });

  it('en producción, un /config.json inválido impide el arranque (fail-closed)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ apiUrl: '' }),
    } as Response);

    const configureSpy = vi.spyOn(TestBed, 'configureTestingModule');

    // Secuencia idéntica a main.ts: primero se resuelve el config; sólo si
    // resuelve se configura y arranca la aplicación.
    const bootstrapSequence = async (): Promise<void> => {
      const config = await loadAppConfig('/config.json', PRODUCTION_FALLBACK);
      TestBed.configureTestingModule({
        providers: [{ provide: APP_CONFIG, useValue: config }],
      });
    };

    await expect(bootstrapSequence()).rejects.toThrow(
      /Error crítico al cargar la configuración de runtime/,
    );
    expect(configureSpy).not.toHaveBeenCalled();
  });
});
