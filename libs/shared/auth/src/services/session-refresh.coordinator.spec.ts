import '@angular/compiler';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import type { AuthResponse } from '../interfaces/auth.interfaces';
import { AuthApiClient } from './auth-api.client';
import { SessionRefreshCoordinator } from './session-refresh.coordinator';

interface LockManagerLike {
  request: (name: string, callback: () => Promise<unknown>) => Promise<unknown>;
}

describe('SessionRefreshCoordinator', () => {
  let coordinator: SessionRefreshCoordinator;
  let refreshMock: ReturnType<typeof vi.fn>;
  let originalLocks: PropertyDescriptor | undefined;
  let lockNames: string[];

  const mockAuthResponse: AuthResponse = {
    token: 'jwt-coordinator-token',
    userId: 'usr-001',
    roleId: '00000000-0000-0000-0000-000000000001',
    role: 'SuperAdmin',
    email: 'admin@nalunpos.com',
    fullName: 'Administrador Nalun',
    tenantId: null,
    expiresAtUtc: new Date(Date.now() + 3600 * 1000).toISOString(),
  };

  beforeEach(() => {
    originalLocks = Object.getOwnPropertyDescriptor(navigator, 'locks');
    lockNames = [];
    refreshMock = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        SessionRefreshCoordinator,
        { provide: AuthApiClient, useValue: { refresh: refreshMock } },
      ],
    });

    coordinator = TestBed.inject(SessionRefreshCoordinator);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    if (originalLocks) {
      Object.defineProperty(navigator, 'locks', originalLocks);
    } else {
      Reflect.deleteProperty(navigator, 'locks');
    }
    vi.restoreAllMocks();
  });

  function installLockManager(): LockManagerLike {
    let tail: Promise<unknown> = Promise.resolve();
    const lockManager: LockManagerLike = {
      request: (name, callback) => {
        lockNames.push(name);
        const run = tail.then(() => callback());
        tail = run.catch(() => undefined);
        return run;
      },
    };
    Object.defineProperty(navigator, 'locks', {
      configurable: true,
      value: lockManager,
    });
    return lockManager;
  }

  it('debe compartir un unico refresh en vuelo entre llamadas concurrentes de la pestana', () => {
    const subject = new Subject<AuthResponse>();
    refreshMock.mockReturnValue(subject.asObservable());

    const received: AuthResponse[] = [];
    coordinator.refresh().subscribe((value) => received.push(value));
    coordinator.refresh().subscribe((value) => received.push(value));

    expect(refreshMock).toHaveBeenCalledTimes(1);

    subject.next(mockAuthResponse);
    subject.complete();

    expect(received).toEqual([mockAuthResponse, mockAuthResponse]);
  });

  it('debe iniciar un nuevo refresh despues de completar el anterior', () => {
    refreshMock.mockReturnValue(of(mockAuthResponse));

    coordinator.refresh().subscribe();
    coordinator.refresh().subscribe();

    expect(refreshMock).toHaveBeenCalledTimes(2);
  });

  it('debe resetear el single-flight cuando el refresh falla para permitir reintentos', () => {
    refreshMock.mockReturnValueOnce(throwError(() => new Error('refresh failed')));

    let failed = false;
    coordinator.refresh().subscribe({ error: () => (failed = true) });
    expect(failed).toBe(true);

    refreshMock.mockReturnValueOnce(of(mockAuthResponse));
    let recovered: AuthResponse | undefined;
    coordinator.refresh().subscribe((value) => (recovered = value));

    expect(refreshMock).toHaveBeenCalledTimes(2);
    expect(recovered).toEqual(mockAuthResponse);
  });

  it('debe ejecutar el refresh bajo el lock "nalunpos-session-refresh" cuando navigator.locks existe', async () => {
    installLockManager();
    refreshMock.mockReturnValue(of(mockAuthResponse));

    let received: AuthResponse | undefined;
    coordinator.refresh().subscribe((value) => (received = value));

    await vi.waitFor(() => expect(received).toEqual(mockAuthResponse));
    expect(lockNames).toEqual(['nalunpos-session-refresh']);
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it('debe serializar el refresh entre dos pestanas que comparten navigator.locks', async () => {
    const lockManager = installLockManager();
    const firstRefresh = new Subject<AuthResponse>();
    const secondRefresh = new Subject<AuthResponse>();
    refreshMock.mockReturnValueOnce(firstRefresh.asObservable());
    refreshMock.mockReturnValueOnce(secondRefresh.asObservable());

    const firstTab = TestBed.runInInjectionContext(() => new SessionRefreshCoordinator());
    const secondTab = TestBed.runInInjectionContext(() => new SessionRefreshCoordinator());

    const firstValues: AuthResponse[] = [];
    const secondValues: AuthResponse[] = [];
    firstTab.refresh().subscribe((value) => firstValues.push(value));
    secondTab.refresh().subscribe((value) => secondValues.push(value));

    await vi.waitFor(() => expect(refreshMock).toHaveBeenCalledTimes(1));
    expect(lockManager).toBeDefined();

    firstRefresh.next(mockAuthResponse);
    firstRefresh.complete();

    await vi.waitFor(() => expect(refreshMock).toHaveBeenCalledTimes(2));

    secondRefresh.next(mockAuthResponse);
    secondRefresh.complete();

    await vi.waitFor(() => expect(secondValues).toEqual([mockAuthResponse]));
    expect(firstValues).toEqual([mockAuthResponse]);
  });

  it('debe degradar a single-flight sin locks cuando navigator.locks no existe', () => {
    Reflect.deleteProperty(navigator, 'locks');
    const subject = new Subject<AuthResponse>();
    refreshMock.mockReturnValue(subject.asObservable());

    coordinator.refresh().subscribe();
    coordinator.refresh().subscribe();

    expect(lockNames).toEqual([]);
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });
});
