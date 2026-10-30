import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { LayoutService } from './layout.service';
import {
  APP_NAV_CONFIG,
  AUTH_GATEWAY,
  type AppNavConfig,
  type AuthGateway,
} from '@nalunpos/shared/util';

describe('SidebarComponent', () => {
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
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
    moduleMap: {},
    navGroups: [
      {
        key: 'grp1',
        title: 'Group 1',
        colorDot: 'dot',
        groupIcon: 'icon',
        groupIconColor: 'color',
        items: [{ label: 'Item 1', route: '/item1', icon: 'icon' }],
      },
      {
        key: 'grp2',
        title: 'Group 2',
        colorDot: 'dot',
        groupIcon: 'icon',
        groupIconColor: 'color',
        items: [{ label: 'Item 2', route: '/item2', icon: 'icon' }],
      },
    ],
  };

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
    };

    authGatewayMock = {
      logout: vi.fn(),
    };

    layoutService = new LayoutService();

    TestBed.configureTestingModule({
      providers: [
        SidebarComponent,
        { provide: Router, useValue: routerMock },
        { provide: AUTH_GATEWAY, useValue: authGatewayMock },
        { provide: APP_NAV_CONFIG, useValue: mockNavConfig },
        { provide: LayoutService, useValue: layoutService },
      ],
    });
  });

  it('debe gestionar colapso, hover y grupos de navegación', () => {
    const comp = TestBed.inject(SidebarComponent);

    (comp as any).toggleCollapse();
    expect(layoutService.isSidebarCollapsed()).toBe(true);

    (comp as any).onMouseEnter();
    expect((comp as any).isHovered()).toBe(true);

    (comp as any).onMouseLeave();
    expect((comp as any).isHovered()).toBe(false);

    (comp as any).toggleGroup('grp1');
    expect((comp as any).groupCollapsedState()['grp1']).toBe(true);

    (comp as any).toggleMasterCollapse();
    expect((comp as any).isMasterCollapsed()).toBe(true);

    (comp as any).logout();
    expect(authGatewayMock.logout).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
