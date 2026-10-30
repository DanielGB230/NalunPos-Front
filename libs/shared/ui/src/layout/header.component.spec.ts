import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { HeaderComponent } from './header.component';
import { LayoutService } from './layout.service';
import {
  APP_NAV_CONFIG,
  AUTH_GATEWAY,
  type AppNavConfig,
  type AuthGateway,
} from '@nalunpos/shared/util';

describe('HeaderComponent', () => {
  let routerMock: { url: string; events: any; navigate: ReturnType<typeof vi.fn> };
  let authGatewayMock: Partial<AuthGateway>;
  let layoutService: LayoutService;

  const mockNavConfig: AppNavConfig = {
    appTitle: 'Test App',
    appSubtitle: 'Test Sub',
    statusLabel: 'Online',
    statusBadge: 'OK',
    systemStatusText: 'Active',
    moduleSectionTitle: 'Modules',
    defaultModuleName: 'General',
    moduleMap: { '/almacenes': 'Almacenes' },
    navGroups: [],
  };

  beforeEach(() => {
    routerMock = {
      url: '/almacenes',
      events: of(),
      navigate: vi.fn(),
    };

    authGatewayMock = {
      currentUser: signal({ id: 'u1', email: 'test@nalunpos.com', tenantId: 't1' }),
      logout: vi.fn(),
    };

    layoutService = new LayoutService();

    TestBed.configureTestingModule({
      providers: [
        HeaderComponent,
        { provide: Router, useValue: routerMock },
        { provide: AUTH_GATEWAY, useValue: authGatewayMock },
        { provide: APP_NAV_CONFIG, useValue: mockNavConfig },
        { provide: LayoutService, useValue: layoutService },
      ],
    });
  });

  it('debe calcular el nombre de módulo activo y alternar menús', () => {
    const comp = TestBed.inject(HeaderComponent);
    expect((comp as any).activeModuleName()).toBe('Almacenes');

    (comp as any).toggleUserMenu();
    expect((comp as any).showUserMenu()).toBe(true);

    (comp as any).toggleMobileMenu();
    expect(layoutService.isMobileMenuOpen()).toBe(true);

    (comp as any).toggleSidebar();
    expect(layoutService.isSidebarCollapsed()).toBe(true);

    (comp as any).logout();
    expect(authGatewayMock.logout).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
