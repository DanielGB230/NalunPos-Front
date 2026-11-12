import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { EMPTY_GUID, TENANT_ROLES, USER_ROLES, type UserRole } from '../models/user-role.model';
import { AuthService } from '../services/auth.service';
import { authGuard, roleGuard } from './auth.guards';

describe('Auth Guards', () => {
  let authServiceMock: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    userRole: ReturnType<typeof vi.fn>;
    tenantId: ReturnType<typeof vi.fn>;
  };
  let routerMock: {
    createUrlTree: ReturnType<typeof vi.fn>;
  };

  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyState = {} as RouterStateSnapshot;

  beforeEach(() => {
    authServiceMock = {
      isAuthenticated: vi.fn(),
      userRole: vi.fn(),
      tenantId: vi.fn(),
    };

    routerMock = {
      createUrlTree: vi.fn((commands: string[]) => ({
        toString: () => commands.join('/'),
      })),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  describe('authGuard', () => {
    it('debe permitir la activación si el usuario está autenticado', () => {
      authServiceMock.isAuthenticated.mockReturnValue(true);

      const result = TestBed.runInInjectionContext(() => authGuard(dummyRoute, dummyState));
      expect(result).toBe(true);
    });

    it('debe redirigir a /login si el usuario no está autenticado', () => {
      authServiceMock.isAuthenticated.mockReturnValue(false);

      const result = TestBed.runInInjectionContext(() => authGuard(dummyRoute, dummyState));
      expect(result).toHaveProperty('toString');
      expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('roleGuard', () => {
    it('debe redirigir a /login si el usuario no está autenticado', () => {
      authServiceMock.isAuthenticated.mockReturnValue(false);

      const guard = roleGuard(['SuperAdmin']);
      const result = TestBed.runInInjectionContext(() => guard(dummyRoute, dummyState));

      expect(result).toHaveProperty('toString');
      expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
    });

    it('debe permitir la navegación si el rol del usuario coincide con allowedRoles y tenantId es coherente', () => {
      authServiceMock.isAuthenticated.mockReturnValue(true);
      authServiceMock.userRole.mockReturnValue('SuperAdmin');
      authServiceMock.tenantId.mockReturnValue(null);

      const guard = roleGuard(['SuperAdmin', 'TenantAdmin']);
      const result = TestBed.runInInjectionContext(() => guard(dummyRoute, dummyState));

      expect(result).toBe(true);
    });

    it('debe aceptar listas readonly UserRole[] como TENANT_ROLES o USER_ROLES', () => {
      authServiceMock.isAuthenticated.mockReturnValue(true);
      authServiceMock.userRole.mockReturnValue('InventoryManager');
      authServiceMock.tenantId.mockReturnValue('tenant-01');

      const guard = roleGuard(TENANT_ROLES);
      const result = TestBed.runInInjectionContext(() => guard(dummyRoute, dummyState));

      expect(result).toBe(true);
    });

    it.each<UserRole>(USER_ROLES)(
      'debe permitir el acceso para el rol canónico "%s" cuando está incluido en allowedRoles y es coherente',
      (canonicalRole) => {
        authServiceMock.isAuthenticated.mockReturnValue(true);
        authServiceMock.userRole.mockReturnValue(canonicalRole);
        authServiceMock.tenantId.mockReturnValue(
          canonicalRole === 'SuperAdmin' ? null : 'tenant-01',
        );

        const guard = roleGuard([canonicalRole]);
        const result = TestBed.runInInjectionContext(() => guard(dummyRoute, dummyState));

        expect(result).toBe(true);
      },
    );

    it('debe redirigir a /forbidden si el rol del usuario no tiene permisos', () => {
      authServiceMock.isAuthenticated.mockReturnValue(true);
      authServiceMock.userRole.mockReturnValue('Cajero');
      authServiceMock.tenantId.mockReturnValue('tenant-01');

      const guard = roleGuard(['SuperAdmin', 'TenantAdmin']);
      const result = TestBed.runInInjectionContext(() => guard(dummyRoute, dummyState));

      expect(result).toHaveProperty('toString');
      expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/forbidden']);
    });

    it('debe redirigir a /forbidden (fail-closed) cuando el usuario autenticado carece de rol (null)', () => {
      authServiceMock.isAuthenticated.mockReturnValue(true);
      authServiceMock.userRole.mockReturnValue(null);
      authServiceMock.tenantId.mockReturnValue(null);

      const guard = roleGuard(USER_ROLES);
      const result = TestBed.runInInjectionContext(() => guard(dummyRoute, dummyState));

      expect(result).toHaveProperty('toString');
      expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/forbidden']);
    });

    it('debe redirigir a /forbidden (fail-closed) cuando el rol en sesión no es canónico (ej. legacy)', () => {
      authServiceMock.isAuthenticated.mockReturnValue(true);
      authServiceMock.userRole.mockReturnValue('Cashier');
      authServiceMock.tenantId.mockReturnValue('tenant-01');

      const guard = roleGuard(USER_ROLES);
      const result = TestBed.runInInjectionContext(() => guard(dummyRoute, dummyState));

      expect(result).toHaveProperty('toString');
      expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/forbidden']);
    });

    it('debe redirigir a /forbidden (defensa en profundidad) si SuperAdmin tiene tenantId no nulo', () => {
      authServiceMock.isAuthenticated.mockReturnValue(true);
      authServiceMock.userRole.mockReturnValue('SuperAdmin');
      authServiceMock.tenantId.mockReturnValue('tenant-invalido');

      const guard = roleGuard(['SuperAdmin']);
      const result = TestBed.runInInjectionContext(() => guard(dummyRoute, dummyState));

      expect(result).toHaveProperty('toString');
      expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/forbidden']);
    });

    it('debe redirigir a /forbidden (defensa en profundidad) si un rol de tenant tiene tenantId null o Guid.Empty', () => {
      authServiceMock.isAuthenticated.mockReturnValue(true);
      authServiceMock.userRole.mockReturnValue('Cajero');

      authServiceMock.tenantId.mockReturnValue(null);
      const guard = roleGuard(TENANT_ROLES);
      expect(routerMock.createUrlTree).not.toHaveBeenCalled();
      TestBed.runInInjectionContext(() => guard(dummyRoute, dummyState));
      expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/forbidden']);

      routerMock.createUrlTree.mockClear();
      authServiceMock.tenantId.mockReturnValue(EMPTY_GUID);
      TestBed.runInInjectionContext(() => guard(dummyRoute, dummyState));
      expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/forbidden']);
    });
  });
});
