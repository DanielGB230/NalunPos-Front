import type { AppNavConfig } from '@nalunpos/shared/ui';

export const ADMIN_NAV_CONFIG: AppNavConfig = {
  appTitle: 'NALUN POS',
  appSubtitle: 'SUPERADMIN',
  statusLabel: 'Cluster LATAM Core',
  statusBadge: '99.99% SLA',
  systemStatusText: 'Cluster LATAM-Core Activo',
  moduleSectionTitle: 'Módulos del Sistema',
  defaultModuleName: 'SuperAdmin',
  moduleMap: {
    '/tenants': 'Tenants & Empresas',
    '/planes': 'Planes & Suscripciones',
    '/plataforma': 'Config. Plataforma',
    '/usuarios-admin': 'Usuarios Admin',
    '/dashboard': 'Dashboard',
  },
  navGroups: [
    {
      key: 'tenants',
      title: 'TENANTS & NEGOCIOS',
      colorDot: 'bg-[#92AAE7] ring-2 ring-[#DBE6FB]',
      groupIcon: 'tenants',
      groupIconColor: 'text-[#92AAE7]',
      items: [
        { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
        { label: 'Tenants & Empresas', route: '/tenants', icon: 'tenants', badge: 'LIVE' },
        { label: 'Planes & Suscripciones', route: '/planes', icon: 'planes' },
      ],
    },
    {
      key: 'sistemica',
      title: 'SISTÉMICA & SHARDS',
      colorDot: 'bg-[#92AAE7] ring-2 ring-[#DBE6FB]',
      groupIcon: 'sistemica',
      groupIconColor: 'text-[#92AAE7]',
      items: [
        { label: 'Config. Plataforma', route: '/plataforma', icon: 'plataforma' },
        { label: 'Usuarios Admin', route: '/usuarios-admin', icon: 'usuarios' },
      ],
    },
  ],
};
