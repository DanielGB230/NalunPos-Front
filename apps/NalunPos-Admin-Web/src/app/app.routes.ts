// =============================================================================
// app.routes.ts — NalunPos-Admin-Web (Panel SuperAdmin)
// =============================================================================

import type { Routes } from '@angular/router';
import { authGuard, roleGuard } from '@nalunpos/shared/auth';
import {
  AppShellComponent,
  BaseLoginComponent,
  ForbiddenComponent,
  NotFoundComponent,
} from '@nalunpos/shared/ui';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  // ─── Login (pública) ─────────────────────────────────────────────────────
  {
    path: 'login',
    component: BaseLoginComponent,
    title: 'Iniciar sesión — NalunPos Admin',
  },

  // ─── Layout Protegido (SuperAdmin exclusivo) ─────────────────────────────
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.dashboardRoutes,
          ),
        title: 'Dashboard — NalunPos Admin',
      },
      {
        path: 'tenants',
        canActivate: [roleGuard(['SuperAdmin'])],
        loadChildren: () =>
          import('./features/tenants/tenants.routes').then((m) => m.tenantsRoutes),
        title: 'Tenants — NalunPos Admin',
      },
      {
        path: 'planes',
        canActivate: [roleGuard(['SuperAdmin'])],
        loadChildren: () =>
          import('./features/planes/planes.routes').then((m) => m.planesRoutes),
        title: 'Planes — NalunPos Admin',
      },
      {
        path: 'plataforma',
        canActivate: [roleGuard(['SuperAdmin'])],
        loadChildren: () =>
          import('./features/plataforma/plataforma.routes').then(
            (m) => m.plataformaRoutes,
          ),
        title: 'Plataforma — NalunPos Admin',
      },
      {
        path: 'usuarios-admin',
        canActivate: [roleGuard(['SuperAdmin'])],
        loadChildren: () =>
          import('./features/usuarios-admin/usuarios-admin.routes').then(
            (m) => m.usuariosAdminRoutes,
          ),
        title: 'Usuarios Admin — NalunPos Admin',
      },
    ],
  },

  // ─── Páginas de error ─────────────────────────────────────────────────────
  {
    path: 'forbidden',
    component: ForbiddenComponent,
    title: 'Acceso denegado — NalunPos Admin',
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Página no encontrada — NalunPos Admin',
  },
];
