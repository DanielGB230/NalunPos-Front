import type { AppNavConfig } from '@nalunpos/shared/ui';

export const WEB_NAV_CONFIG: AppNavConfig = {
  appTitle: 'NALUN POS',
  appSubtitle: 'ADMIN NEGOCIO',
  statusLabel: 'Empresa Activa',
  statusBadge: 'ONLINE',
  systemStatusText: 'Cluster LATAM-Core Activo',
  moduleSectionTitle: 'Módulos del Negocio',
  defaultModuleName: 'POS Operations',
  moduleMap: {
    '/categorias': 'Categorías',
    '/almacenes': 'Almacenes',
    '/productos': 'Productos',
    '/ventas': 'Ventas & POS',
    '/inventario': 'Inventario',
    '/compras': 'Órdenes de Compra',
    '/proveedores': 'Proveedores',
    '/clientes': 'Clientes',
    '/usuarios': 'Usuarios',
    '/dashboard': 'Dashboard',
  },
  navGroups: [
    {
      key: 'comercial',
      title: 'COMERCIAL & VENTAS',
      colorDot: 'bg-[#92AAE7] ring-2 ring-[#DBE6FB]',
      groupIcon: 'comercial',
      groupIconColor: 'text-[#92AAE7]',
      items: [
        { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
        { label: 'Terminal POS (Caja)', route: '/ventas', icon: 'ventas' },
        { label: 'Clientes', route: '/clientes', icon: 'clientes' },
      ],
    },
    {
      key: 'inventario',
      title: 'INVENTARIO & RECETAS',
      colorDot: 'bg-[#92AAE7] ring-2 ring-[#DBE6FB]',
      groupIcon: 'inventario',
      groupIconColor: 'text-[#92AAE7]',
      items: [
        { label: 'Stock & Bodegas', route: '/inventario', icon: 'inventario' },
        { label: 'Almacenes', route: '/almacenes', icon: 'inventario' },
        { label: 'Productos', route: '/productos', icon: 'productos' },
        { label: 'Categorías', route: '/categorias', icon: 'categorias' },
        { label: 'Órdenes de Compra', route: '/compras', icon: 'compras' },
        { label: 'Proveedores', route: '/proveedores', icon: 'proveedores' },
      ],
    },
    {
      key: 'admin',
      title: 'ADMINISTRACIÓN & ACCESOS',
      colorDot: 'bg-[#92AAE7] ring-2 ring-[#DBE6FB]',
      groupIcon: 'admin',
      groupIconColor: 'text-[#92AAE7]',
      items: [
        { label: 'Usuarios & Roles', route: '/usuarios', icon: 'usuarios' },
      ],
    },
  ],
};
