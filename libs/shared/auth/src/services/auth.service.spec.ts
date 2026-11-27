import '@angular/compiler';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import type { AppError } from '@nalunpos/shared/data-access';
import { Subject, of, throwError } from 'rxjs';
import type { AuthResponse, LoginRequest } from '../interfaces/auth.interfaces';
import { AuthApiClient } from './auth-api.client';
import { AuthService } from './auth.service';
import { SessionRefreshCoordinator } from './session-refresh.coordinator';

describe('AuthService', () => {
  let service: AuthService;
  let authApiMock: { login: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> };
  let coordinatorMock: { refresh: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  const mockSuperAdminResponse: AuthResponse = {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-jwt-token',
    userId: 'usr-001',
    roleId: '00000000-0000-0000-0000-000000000001',
    role: 'SuperAdmin',
    email: 'admin@nalunpos.com',
    fullName: 'Administrador Nalun',
    tenantId: null,
    expiresAtUtc: new Date(Date.now() + 3600 * 1000).toISOString(),
  };

  const mockTenantCajeroResponse: AuthResponse = {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tenant-cajero-jwt',
    userId: 'usr-002',
    roleId: 'role-cajero-001',
    role: 'Cajero',
    email: 'cajero@empresa.com',
    fullName: 'Carlos Cajero',
    tenantId: 'tenant-enterprise-01',
    expiresAtUtc: new Date(Date.now() + 3600 * 1000).toISOString(),
  };

  beforeEach(() => {
    authApiMock = {
      login: vi.fn(),
      logout: vi.fn().mockReturnValue(of(undefined)),
    };

    coordinatorMock = {
      refresh: vi.fn(),
    };

    routerMock = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AuthApiClient, useValue: authApiMock },
        { provide: SessionRefreshCoordinator, useValue: coordinatorMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('debe inicializarse sin sesion en memoria', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.userRole()).toBeNull();
    expect(service.tenantId()).toBeNull();
    expect(service.getToken()).toBeNull();
    expect(service.token()).toBeNull();
  });

  it('debe cambiar isAuthenticated a false cuando la sesion en memoria expira', () => {
    const start = new Date('2026-11-12T10:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(start);

    authApiMock.login.mockReturnValue(
      of({ ...mockSuperAdminResponse, expiresAtUtc: '2026-11-12T11:00:00.000Z' }),
    );

    service.login({ email: 'admin@nalunpos.com', password: 'StrongPassword123!' }).subscribe();
    expect(service.currentUser()).not.toBeNull();

    vi.setSystemTime(new Date('2026-11-12T11:00:00.000Z'));
    expect(service.isAuthenticated()).toBe(false);
  });

  it('debe autenticar SuperAdmin valido y actualizar signals sin persistir en storage', () => {
    authApiMock.login.mockReturnValue(of(mockSuperAdminResponse));

    const credentials: LoginRequest = {
      email: 'admin@nalunpos.com',
      password: 'StrongPassword123!',
    };

    let result: AuthResponse | undefined;
    service.login(credentials).subscribe((res) => {
      result = res;
    });

    expect(authApiMock.login).toHaveBeenCalledWith(credentials);
    expect(result).toEqual(mockSuperAdminResponse);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.email).toBe('admin@nalunpos.com');
    expect(service.userRole()).toBe('SuperAdmin');
    expect(service.tenantId()).toBeNull();
    expect(service.getToken()).toBe(mockSuperAdminResponse.token);
    expect(service.token()).toBe(mockSuperAdminResponse.token);
  });

  it('debe autenticar usuario de tenant Cajero con tenantId y actualizar signals correctamente', () => {
    authApiMock.login.mockReturnValue(of(mockTenantCajeroResponse));

    service.login({ email: 'cajero@empresa.com', password: 'Password123!' }).subscribe();

    expect(service.isAuthenticated()).toBe(true);
    expect(service.userRole()).toBe('Cajero');
    expect(service.tenantId()).toBe('tenant-enterprise-01');
    expect(service.currentUser()?.isSuperAdmin).toBe(false);
  });

  it('no debe actualizar estado si el login falla con error HTTP', () => {
    authApiMock.login.mockReturnValue(throwError(() => new Error('Credenciales invalidas')));

    let errorCaught = false;
    service.login({ email: 'wrong@nalunpos.com', password: 'bad' }).subscribe({
      next: () => expect.fail('No debio ser exitoso'),
      error: () => {
        errorCaught = true;
      },
    });

    expect(errorCaught).toBe(true);
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.getToken()).toBeNull();
  });

  it('debe fallar cerrado con error generico si el backend responde con rol desconocido', () => {
    authApiMock.login.mockReturnValue(of({ ...mockTenantCajeroResponse, role: 'Cashier' }));

    let capturedError: AppError | undefined;
    service.login({ email: 'cajero@empresa.com', password: 'Password123!' }).subscribe({
      next: () => expect.fail('No debio aceptar rol no canonico'),
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    expect(capturedError?.code).toBe('AUTH_INVALID_SESSION');
    expect(capturedError?.message).toBe(
      'No fue posible iniciar sesión. Verifica tus credenciales e intenta de nuevo.',
    );
    expect(capturedError?.message).not.toContain('role');
    expect(capturedError?.message).not.toContain('Cashier');
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('debe fallar cerrado en login cuando hay incoherencia entre rol SuperAdmin y tenantId no nulo', () => {
    authApiMock.login.mockReturnValue(
      of({ ...mockSuperAdminResponse, tenantId: 'tenant-invalido-para-superadmin' }),
    );

    let capturedError: AppError | undefined;
    service.login({ email: 'admin@nalunpos.com', password: 'Password123!' }).subscribe({
      next: () => expect.fail('No debio aceptar SuperAdmin con tenantId'),
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    expect(capturedError?.code).toBe('AUTH_INVALID_SESSION');
    expect(service.currentUser()).toBeNull();
  });

  it('debe fallar cerrado en login cuando un rol de tenant viene con tenantId null', () => {
    authApiMock.login.mockReturnValue(of({ ...mockTenantCajeroResponse, tenantId: null }));

    let capturedError: AppError | undefined;
    service.login({ email: 'cajero@empresa.com', password: 'Password123!' }).subscribe({
      next: () => expect.fail('No debio aceptar Cajero sin tenantId'),
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    expect(capturedError?.code).toBe('AUTH_INVALID_SESSION');
    expect(service.currentUser()).toBeNull();
  });

  it('debe restaurar la sesion al inicializar cuando el refresh devuelve un LoginResponse valido', () => {
    coordinatorMock.refresh.mockReturnValue(of(mockTenantCajeroResponse));

    let completed = false;
    service.initializeSession().subscribe({
      next: () => {
        /* sin valor */
      },
      complete: () => {
        completed = true;
      },
    });

    expect(completed).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.email).toBe('cajero@empresa.com');
    expect(service.getToken()).toBe(mockTenantCajeroResponse.token);
  });

  it('debe completar sin sesion cuando el refresh devuelve una respuesta invalida fail-closed', () => {
    coordinatorMock.refresh.mockReturnValue(of({ ...mockTenantCajeroResponse, role: 'Cashier' }));

    let completed = false;
    service.initializeSession().subscribe({
      error: () => expect.fail('initializeSession nunca debe lanzar'),
      complete: () => {
        completed = true;
      },
    });

    expect(completed).toBe(true);
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it.each([
    { code: 'HTTP_400', status: 400 },
    { code: 'Auth.RefreshTokenInvalid', status: 401 },
    { code: 'Tenant.Suspended', status: 403 },
    { code: 'Auth.RefreshConcurrent', status: 409 },
    { code: 'HTTP_429', status: 429 },
    { code: 'HTTP_500', status: 500 },
    { code: 'HTTP_0', status: 0 },
  ])(
    'debe completar sin sesion ni lanzar cuando el refresh falla con $status',
    ({ code, status }) => {
      coordinatorMock.refresh.mockReturnValue(
        throwError(() => ({ code, message: 'refresh failed', status })),
      );

      let completed = false;
      service.initializeSession().subscribe({
        error: () => expect.fail('initializeSession nunca debe lanzar'),
        complete: () => {
          completed = true;
        },
      });

      expect(completed).toBe(true);
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    },
  );

  it('debe limpiar una sesion existente si el refresh de inicializacion falla', () => {
    authApiMock.login.mockReturnValue(of(mockSuperAdminResponse));
    service.login({ email: 'admin@nalunpos.com', password: 'pwd' }).subscribe();
    expect(service.isAuthenticated()).toBe(true);

    coordinatorMock.refresh.mockReturnValue(throwError(() => new Error('network down')));

    service.initializeSession().subscribe();

    expect(service.currentUser()).toBeNull();
    expect(service.getToken()).toBeNull();
  });

  it('debe limpiar la sesion en memoria, navegar a /login y llamar al logout del servidor', () => {
    authApiMock.login.mockReturnValue(of(mockSuperAdminResponse));
    service.login({ email: 'admin@nalunpos.com', password: 'pwd' }).subscribe();
    expect(service.isAuthenticated()).toBe(true);

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.userRole()).toBeNull();
    expect(service.getToken()).toBeNull();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    expect(authApiMock.logout).toHaveBeenCalledTimes(1);
  });

  it('debe silenciar el error del logout del servidor sin lanzar', () => {
    authApiMock.logout.mockReturnValue(throwError(() => new Error('network down')));

    expect(() => service.logout()).not.toThrow();
    expect(authApiMock.logout).toHaveBeenCalledTimes(1);
    expect(service.currentUser()).toBeNull();
  });

  it('debe navegar de inmediato sin esperar la respuesta del logout del servidor', () => {
    const pendingLogout = new Subject<void>();
    authApiMock.logout.mockReturnValue(pendingLogout.asObservable());

    const result: void = service.logout();

    expect(result).toBeUndefined();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    expect(service.currentUser()).toBeNull();
  });
});
