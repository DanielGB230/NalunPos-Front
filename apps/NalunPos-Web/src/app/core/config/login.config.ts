import type { LoginConfig } from '@nalunpos/shared/ui';

export const WEB_LOGIN_CONFIG: LoginConfig = {
  portalTitle: 'Portal Empresas',
  portalIcon: 'storefront',
  editorialSubtitle: 'Acceso al Ecosistema',
  editorialDescription:
    'Terminal unificada para operaciones omnicanal, liquidación de flujos instantáneos y control multi-sucursal orquestado con criptografía cuántica de grado empresarial.',
  emailLabel: 'Correo Corporativo',
  emailPlaceholder: 'nombre@empresa.com',
  showTenantField: true,
  defaultTenantIdentifier: 'central-cafe',
  redirectRoute: '/dashboard',
};
