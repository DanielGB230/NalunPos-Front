import '@angular/compiler';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import type { AppError } from '@nalunpos/shared/data-access';
import { of, throwError } from 'rxjs';
import type { AuthResponse, LoginRequest } from '../interfaces/auth.interfaces';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: { post: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  const STORAGE_KEY = 'nalunpos_auth_session';

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
    sessionStorage.clear();

    httpMock = {
      post: vi.fn(),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: httpMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(AuthService);
    service.configureApiUrl('https://api.nalunpos.com');
  });

  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('debe inicializarse no autenticado cuando sessionStorage esta vacio', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.userRole()).toBeNull();
    expect(service.tenantId()).toBeNull();
    expect(service.getToken()).toBeNull();
    expect(service.token()).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });

  it('debe cambiar isAuthenticated a false cuando la sesión activa en memoria expira', () => {
    const start = new Date('2026-11-12T10:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(start);

    const timedResponse: AuthResponse = {
      ...mockSuperAdminResponse,
      expiresAtUtc: '2026-11-12T11:00:00.000Z',
    };
    httpMock.post.mockReturnValue(of(timedResponse));

    service.login({ email: 'admin@nalunpos.com', password: 'StrongPassword123!' }).subscribe();
    expect(service.currentUser()).not.toBeNull();

    vi.setSystemTime(new Date('2026-11-12T11:00:00.000Z'));
    expect(service.isAuthenticated()).toBe(false);
  });

  it('debe autenticar SuperAdmin válido, actualizar signals y persistir exactamente 1 clave unificada en sessionStorage', () => {
    httpMock.post.mockReturnValue(of(mockSuperAdminResponse));

    const credentials: LoginRequest = {
      email: 'admin@nalunpos.com',
      password: 'StrongPassword123!',
    };

    let result: AuthResponse | undefined;
    service.login(credentials).subscribe((res) => {
      result = res;
    });

    expect(result).toEqual(mockSuperAdminResponse);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.email).toBe('admin@nalunpos.com');
    expect(service.userRole()).toBe('SuperAdmin');
    expect(service.tenantId()).toBeNull();
    expect(service.getToken()).toBe(mockSuperAdminResponse.token);
    expect(service.token()).toBe(mockSuperAdminResponse.token);

    // Verificación estricta: exactamente 1 clave en sessionStorage
    expect(sessionStorage.length).toBe(1);
    expect(sessionStorage.getItem('nalunpos_token')).toBeNull();
    expect(sessionStorage.getItem('nalunpos_session')).toBeNull();

    const raw = sessionStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const stored = JSON.parse(raw!);
    expect(stored.token).toBe(mockSuperAdminResponse.token);
    expect(stored.email).toBe('admin@nalunpos.com');
    expect(stored.role).toBe('SuperAdmin');
    expect(stored.tenantId).toBeNull();
    expect(stored.id).toBe('usr-001');
  });

  it('debe autenticar usuario de tenant Cajero con tenantId y actualizar signals correctamente', () => {
    httpMock.post.mockReturnValue(of(mockTenantCajeroResponse));

    service.login({ email: 'cajero@empresa.com', password: 'Password123!' }).subscribe();

    expect(service.isAuthenticated()).toBe(true);
    expect(service.userRole()).toBe('Cajero');
    expect(service.tenantId()).toBe('tenant-enterprise-01');
    expect(service.currentUser()?.isSuperAdmin).toBe(false);
    expect(sessionStorage.length).toBe(1);
  });

  it('no debe actualizar estado ni persistir en storage si el login falla con error HTTP', () => {
    httpMock.post.mockReturnValue(throwError(() => new Error('Credenciales invalidas')));

    const credentials: LoginRequest = {
      email: 'wrong@nalunpos.com',
      password: 'bad',
    };

    let errorCaught = false;
    service.login(credentials).subscribe({
      next: () => expect.fail('No debio ser exitoso'),
      error: () => {
        errorCaught = true;
      },
    });

    expect(errorCaught).toBe(true);
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.getToken()).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });

  it('debe fallar cerrado con error genérico si el backend responde con rol desconocido sin persistir ni autenticar', () => {
    const legacyRoleResponse: AuthResponse = {
      ...mockTenantCajeroResponse,
      role: 'Cashier',
    };
    httpMock.post.mockReturnValue(of(legacyRoleResponse));

    let capturedError: AppError | undefined;
    service.login({ email: 'cajero@empresa.com', password: 'Password123!' }).subscribe({
      next: () => expect.fail('No debio aceptar rol no canónico'),
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
    expect(sessionStorage.length).toBe(0);
  });

  it('debe fallar cerrado en login cuando hay incoherencia entre rol SuperAdmin y tenantId no nulo', () => {
    const incoherentResponse: AuthResponse = {
      ...mockSuperAdminResponse,
      tenantId: 'tenant-invalido-para-superadmin',
    };
    httpMock.post.mockReturnValue(of(incoherentResponse));

    let capturedError: AppError | undefined;
    service.login({ email: 'admin@nalunpos.com', password: 'Password123!' }).subscribe({
      next: () => expect.fail('No debio aceptar SuperAdmin con tenantId'),
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    expect(capturedError?.code).toBe('AUTH_INVALID_SESSION');
    expect(service.currentUser()).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });

  it('debe fallar cerrado en login cuando un rol de tenant viene con tenantId null', () => {
    const incoherentTenantResponse: AuthResponse = {
      ...mockTenantCajeroResponse,
      tenantId: null,
    };
    httpMock.post.mockReturnValue(of(incoherentTenantResponse));

    let capturedError: AppError | undefined;
    service.login({ email: 'cajero@empresa.com', password: 'Password123!' }).subscribe({
      next: () => expect.fail('No debio aceptar Cajero sin tenantId'),
      error: (err: AppError) => {
        capturedError = err;
      },
    });

    expect(capturedError?.code).toBe('AUTH_INVALID_SESSION');
    expect(service.currentUser()).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });

  it('debe limpiar la sesion, dejar sessionStorage.length en 0 y navegar a /login al ejecutar logout', () => {
    httpMock.post.mockReturnValue(of(mockSuperAdminResponse));
    service.login({ email: 'admin@nalunpos.com', password: 'pwd' }).subscribe();
    expect(service.isAuthenticated()).toBe(true);
    expect(sessionStorage.length).toBe(1);

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.userRole()).toBeNull();
    expect(service.getToken()).toBeNull();
    expect(sessionStorage.length).toBe(0);
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debe restaurar una sesion activa valida desde la clave unificada de sessionStorage al inicializarse', () => {
    const futureDate = new Date(Date.now() + 3600000).toISOString();
    const storedSession = {
      id: 'usr-restore',
      name: 'Usuario Restaurado',
      email: 'restore@nalunpos.com',
      role: 'SuperAdmin',
      tenantId: null,
      token: 'valid-restored-jwt',
      expiresAt: futureDate,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(storedSession));
    expect(sessionStorage.length).toBe(1);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: httpMock },
        { provide: Router, useValue: routerMock },
      ],
    });
    const restoredService = TestBed.inject(AuthService);

    expect(restoredService.isAuthenticated()).toBe(true);
    expect(restoredService.currentUser()?.email).toBe('restore@nalunpos.com');
    expect(restoredService.getToken()).toBe('valid-restored-jwt');
    expect(restoredService.userRole()).toBe('SuperAdmin');
    expect(restoredService.tenantId()).toBeNull();
    expect(sessionStorage.length).toBe(1);
  });

  it('debe limpiar sessionStorage y dejar length en 0 si la sesion almacenada esta expirada', () => {
    const pastDate = new Date(Date.now() - 3600000).toISOString();
    const expiredSession = {
      id: 'usr-expired',
      name: 'Usuario Expirado',
      email: 'expired@nalunpos.com',
      role: 'SuperAdmin',
      tenantId: null,
      token: 'expired-token',
      expiresAt: pastDate,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(expiredSession));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: httpMock },
        { provide: Router, useValue: routerMock },
      ],
    });
    const restoredService = TestBed.inject(AuthService);

    expect(restoredService.isAuthenticated()).toBe(false);
    expect(restoredService.getToken()).toBeNull();
    expect(sessionStorage.length).toBe(0);
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('debe limpiar sessionStorage si el JSON en storage es invalido o corrupto', () => {
    sessionStorage.setItem(STORAGE_KEY, '{invalid-json');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: httpMock },
        { provide: Router, useValue: routerMock },
      ],
    });
    const restoredService = TestBed.inject(AuthService);

    expect(restoredService.isAuthenticated()).toBe(false);
    expect(restoredService.getToken()).toBeNull();
    expect(sessionStorage.length).toBe(0);
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('debe limpiar sessionStorage si el objeto almacenado esta incompleto o tiene token vacio', () => {
    const incompleteSession = {
      id: 'usr-bad',
      email: 'bad@nalunpos.com',
      role: 'SuperAdmin',
      tenantId: null,
      token: '   ',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(incompleteSession));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: httpMock },
        { provide: Router, useValue: routerMock },
      ],
    });
    const restoredService = TestBed.inject(AuthService);

    expect(restoredService.isAuthenticated()).toBe(false);
    expect(restoredService.getToken()).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });

  it.each(['Cashier', 'Inventory'])(
    'debe limpiar sessionStorage y retornar currentUser null si la sesión almacenada tiene rol legacy "%s"',
    (legacyRole) => {
      const legacySession = {
        id: 'usr-legacy',
        name: 'Usuario Legacy',
        email: 'legacy@nalunpos.com',
        role: legacyRole,
        tenantId: 'tenant-1',
        token: 'legacy-token',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(legacySession));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: HttpClient, useValue: httpMock },
          { provide: Router, useValue: routerMock },
        ],
      });
      const restoredService = TestBed.inject(AuthService);

      expect(restoredService.currentUser()).toBeNull();
      expect(restoredService.isAuthenticated()).toBe(false);
      expect(sessionStorage.length).toBe(0);
    },
  );

  it('debe limpiar sessionStorage y retornar currentUser null si la sesión almacenada tiene SuperAdmin con tenantId no nulo', () => {
    const incoherentSession = {
      id: 'usr-incoherent',
      name: 'Incoherente',
      email: 'admin@nalunpos.com',
      role: 'SuperAdmin',
      tenantId: 'tenant-1',
      token: 'valid-token',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(incoherentSession));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: httpMock },
        { provide: Router, useValue: routerMock },
      ],
    });
    const restoredService = TestBed.inject(AuthService);

    expect(restoredService.currentUser()).toBeNull();
    expect(restoredService.isAuthenticated()).toBe(false);
    expect(sessionStorage.length).toBe(0);
  });

  it('debe limpiar sessionStorage y retornar currentUser null si la sesión almacenada tiene rol de tenant con tenantId null', () => {
    const incoherentTenantSession = {
      id: 'usr-incoherent-tenant',
      name: 'Incoherente Tenant',
      email: 'cajero@nalunpos.com',
      role: 'Cajero',
      tenantId: null,
      token: 'valid-token',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(incoherentTenantSession));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: httpMock },
        { provide: Router, useValue: routerMock },
      ],
    });
    const restoredService = TestBed.inject(AuthService);

    expect(restoredService.currentUser()).toBeNull();
    expect(restoredService.isAuthenticated()).toBe(false);
    expect(sessionStorage.length).toBe(0);
  });
});
