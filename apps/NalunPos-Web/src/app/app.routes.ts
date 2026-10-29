// =============================================================================
// app.routes.ts — NalunPos-Web (Panel Admin Negocio)
// Definición de rutas raíz de la aplicación con Layout Glassmorphism Enterprise.
// =============================================================================

import type { Routes } from '@angular/router';
import { authGuard } from '@nalunpos/shared/auth';
import {
  AppShellComponent,
  BaseLoginComponent,
  ForbiddenComponent,
  NotFoundComponent,
} from '@nalunpos/shared/ui';

export const appRoutes: Routes = [
  // ─── Ruta raíz: redirige según autenticación ─────────────────────────────
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  // ─── Login (pública) ─────────────────────────────────────────────────────
  {
    path: 'login',
    component: BaseLoginComponent,
    title: 'Iniciar sesión — NalunPos',
  },

  // ─── Layout Protegido (Admin Negocio) ─────────────────────────────────────
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
        title: 'Dashboard — NalunPos',
      },
      {
        path: 'productos',
        loadChildren: () =>
          import('./features/productos/productos.routes').then((m) => m.productosRoutes),
        title: 'Productos — NalunPos',
      },
      {
        path: 'ventas',
        loadChildren: () => import('./features/ventas/ventas.routes').then((m) => m.ventasRoutes),
        title: 'Ventas — NalunPos',
      },
      {
        path: 'inventario',
        loadChildren: () =>
          import('./features/inventario/inventario.routes').then((m) => m.inventarioRoutes),
        title: 'Inventario — NalunPos',
      },
      {
        path: 'clientes',
        loadChildren: () =>
          import('./features/clientes/clientes.routes').then((m) => m.clientesRoutes),
        title: 'Clientes — NalunPos',
      },
      {
        path: 'usuarios',
        loadChildren: () =>
          import('./features/usuarios/usuarios.routes').then((m) => m.usuariosRoutes),
        title: 'Usuarios — NalunPos',
      },
      {
        path: 'compras',
        loadChildren: () =>
          import('./features/purchases/purchases.routes').then((m) => m.purchasesRoutes),
        title: 'Compras — NalunPos',
      },
      {
        path: 'proveedores',
        loadChildren: () =>
          import('./features/suppliers/suppliers.routes').then((m) => m.suppliersRoutes),
        title: 'Proveedores — NalunPos',
      },
      {
        path: 'categorias',
        loadChildren: () =>
          import('./features/categories/categories.routes').then((m) => m.categoriesRoutes),
        title: 'Categorías — NalunPos',
      },
      {
        path: 'almacenes',
        loadChildren: () =>
          import('./features/warehouses/warehouses.routes').then((m) => m.warehousesRoutes),
        title: 'Almacenes — NalunPos',
      },
    ],
  },

  // ─── Páginas de error ─────────────────────────────────────────────────────
  {
    path: 'forbidden',
    component: ForbiddenComponent,
    title: 'Acceso denegado — NalunPos',
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Página no encontrada — NalunPos',
  },
];
