import { InjectionToken, type Signal } from '@angular/core';
import type { Observable } from 'rxjs';

export interface NavItem {
  readonly label: string;
  readonly route: string;
  readonly icon: string;
  readonly badge?: string;
}

export interface NavGroup {
  readonly key: string;
  readonly title: string;
  readonly colorDot: string;
  readonly groupIcon: string;
  readonly groupIconColor: string;
  readonly items: NavItem[];
}

export interface AppNavConfig {
  readonly appTitle: string;
  readonly appSubtitle: string;
  readonly statusLabel: string;
  readonly statusBadge: string;
  readonly systemStatusText?: string;
  readonly moduleSectionTitle?: string;
  readonly moduleMap: Record<string, string>;
  readonly defaultModuleName: string;
  readonly navGroups: NavGroup[];
}

export interface AuthUserGateway {
  readonly id?: string;
  readonly email?: string | null;
  readonly role?: string;
  readonly tenantId?: string;
}

export interface AuthGateway {
  readonly currentUser: Signal<AuthUserGateway | null>;
  login(credentials: { email: string; password: string; tenantId?: string }): Observable<unknown>;
  logout(): void;
}

export const APP_NAV_CONFIG = new InjectionToken<AppNavConfig>('APP_NAV_CONFIG');
export const AUTH_GATEWAY = new InjectionToken<AuthGateway>('AUTH_GATEWAY');
