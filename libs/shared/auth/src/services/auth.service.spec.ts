import '@angular/compiler';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import type { AuthResponse, LoginRequest } from '../interfaces/auth.interfaces';
import { TestBed } from '@angular/core/testing';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: { post: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  const mockAuthResponse: AuthResponse = {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-jwt-token',
    refreshToken: 'refresh-token-uuid-1234',
    expiresIn: 3600,
    user: {
      id: 'usr-001',
      email: 'admin@nalunpos.com',
      fullName: 'Administrador Nalun',
      role: 'SuperAdmin',
      tenantId: 'tenant-enterprise-01',
      permissions: ['ALL'],
    },
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
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('debe inicializarse no autenticado cuando sessionStorage esta vacio', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.userRole()).toBeNull();
    expect(service.tenantId()).toBeNull();
  });

  it('debe autenticar al usuario y actualizar signals en login exitoso', () => {
    httpMock.post.mockReturnValue(of(mockAuthResponse));

    const credentials: LoginRequest = {
      email: 'admin@nalunpos.com',
      password: 'StrongPassword123!',
    };

    let result: AuthResponse | undefined;
    service.login(credentials).subscribe((res) => {
      result = res;
    });

    expect(result).toEqual(mockAuthResponse);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.email).toBe('admin@nalunpos.com');
    expect(service.userRole()).toBe('SuperAdmin');
    expect(service.tenantId()).toBe('tenant-enterprise-01');

    expect(sessionStorage.getItem('nalunpos_token')).toBe(mockAuthResponse.token);
    expect(sessionStorage.getItem('nalunpos_session')).toContain('admin@nalunpos.com');
  });

  it('no debe actualizar estado si el login falla con error HTTP', () => {
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
    expect(sessionStorage.getItem('nalunpos_token')).toBeNull();
  });

  it('debe limpiar la sesion, tokens y navegar a /login al ejecutar logout', () => {
    httpMock.post.mockReturnValue(of(mockAuthResponse));
    service.login({ email: 'admin@nalunpos.com', password: 'pwd' }).subscribe();
    expect(service.isAuthenticated()).toBe(true);

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.userRole()).toBeNull();
    expect(sessionStorage.getItem('nalunpos_token')).toBeNull();
    expect(sessionStorage.getItem('nalunpos_session')).toBeNull();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debe restaurar una sesion activa valida desde sessionStorage al inicializarse', () => {
    const futureDate = new Date(Date.now() + 3600000).toISOString();
    const storedSession = {
      id: 'usr-restore',
      name: 'Usuario Restaurado',
      email: 'restore@nalunpos.com',
      role: 'SuperAdmin',
      tenantId: 'tenant-1',
      token: 'valid-token',
      expiresAt: futureDate,
    };
    sessionStorage.setItem('nalunpos_session', JSON.stringify(storedSession));
    sessionStorage.setItem('nalunpos_token', 'valid-token');

    // Reinicializar TestBed
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
  });

  it('debe limpiar sessionStorage si la sesion almacenada esta expirada', () => {
    const pastDate = new Date(Date.now() - 3600000).toISOString();
    const expiredSession = {
      id: 'usr-expired',
      name: 'Usuario Expirado',
      email: 'expired@nalunpos.com',
      role: 'SuperAdmin',
      tenantId: 'tenant-1',
      token: 'expired-token',
      expiresAt: pastDate,
    };
    sessionStorage.setItem('nalunpos_session', JSON.stringify(expiredSession));
    sessionStorage.setItem('nalunpos_token', 'expired-token');

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
    expect(sessionStorage.getItem('nalunpos_session')).toBeNull();
    expect(sessionStorage.getItem('nalunpos_token')).toBeNull();
  });

  it('debe limpiar sessionStorage si el JSON en storage es invalido', () => {
    sessionStorage.setItem('nalunpos_session', '{invalid-json');

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
    expect(sessionStorage.getItem('nalunpos_session')).toBeNull();
  });
});
