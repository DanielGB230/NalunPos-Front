import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BaseLoginComponent } from './base-login.component';
import {
  AUTH_GATEWAY,
  LOGIN_CONFIG,
  type AuthGateway,
  type LoginConfig,
} from '@nalunpos/shared/util';

describe('BaseLoginComponent', () => {
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let authGatewayMock: Partial<AuthGateway>;

  const mockLoginConfig: LoginConfig = {
    portalTitle: 'Portal Test',
    portalIcon: 'lock',
    editorialSubtitle: 'Subtitle',
    editorialDescription: 'Description',
    emailLabel: 'Email',
    emailPlaceholder: 'test@example.com',
    showTenantField: true,
    defaultTenantIdentifier: 'test-tenant',
    redirectRoute: '/dashboard',
  };

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
    };

    authGatewayMock = {
      login: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        BaseLoginComponent,
        { provide: Router, useValue: routerMock },
        { provide: AUTH_GATEWAY, useValue: authGatewayMock },
        { provide: LOGIN_CONFIG, useValue: mockLoginConfig },
      ],
    });
  });

  it('debe inicializarse con configuracion y alternar visibilidad de contraseña', () => {
    const comp = TestBed.inject(BaseLoginComponent);
    expect((comp as any).config).toBe(mockLoginConfig);
    expect((comp as any).showPassword()).toBe(false);

    (comp as any).togglePasswordVisibility();
    expect((comp as any).showPassword()).toBe(true);
  });

  it('debe enviar credenciales y navegar en login exitoso', async () => {
    authGatewayMock.login = vi.fn().mockReturnValue(of({ token: 'abc' }));
    const comp = TestBed.inject(BaseLoginComponent);

    (comp as any).formModel.set({
      email: 'user@example.com',
      password: 'password123',
    });

    await (comp as any).onSubmit();

    expect(authGatewayMock.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
      tenantId: 'test-tenant',
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('debe manejar errores de inicio de sesión', async () => {
    authGatewayMock.login = vi
      .fn()
      .mockReturnValue(throwError(() => ({ message: 'Error de credenciales' })));
    const comp = TestBed.inject(BaseLoginComponent);

    (comp as any).formModel.set({
      email: 'user@example.com',
      password: 'password123',
    });

    await (comp as any).onSubmit();

    expect((comp as any).errorMessage()).toBe('Error de credenciales');
  });
});
