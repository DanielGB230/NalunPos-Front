import { InjectionToken } from '@angular/core';

export interface LoginConfig {
  readonly portalTitle: string;
  readonly portalIcon: string;
  readonly editorialSubtitle: string;
  readonly editorialDescription: string;
  readonly emailLabel: string;
  readonly emailPlaceholder: string;
  readonly showTenantField: boolean;
  readonly defaultTenantIdentifier?: string;
  readonly redirectRoute: string;
}

export const LOGIN_CONFIG = new InjectionToken<LoginConfig>('LOGIN_CONFIG');
