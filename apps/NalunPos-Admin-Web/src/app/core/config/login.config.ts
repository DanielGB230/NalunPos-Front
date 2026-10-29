import type { LoginConfig } from '@nalunpos/shared/ui';

export const ADMIN_LOGIN_CONFIG: LoginConfig = {
  portalTitle: 'Ingreso SuperAdmin',
  portalIcon: 'shield_person',
  editorialSubtitle: 'Panel de Orquestación',
  editorialDescription:
    'Consola de administración global para el aprovisionamiento de tenants, monitoreo en tiempo real de nodos y gestión de seguridad nivel empresarial.',
  emailLabel: 'Correo Administrador',
  emailPlaceholder: 'admin@nalunpos.com',
  showTenantField: false,
  redirectRoute: '/dashboard',
};
