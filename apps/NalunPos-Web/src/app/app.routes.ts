// =============================================================================
// app.routes.ts — NalunPos-Web (Panel Admin Negocio)
// Definición de rutas raíz de la aplicación con Layout Glassmorphism Enterprise.
// =============================================================================

import { Routes } from '@angular/router';
import { authGuard } from '@nalunpos/shared/auth';
import { WebLayoutComponent } from './core/layout/components/web-layout/web-layout.component';

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
    loadComponent: () =>
      import('./core/auth/components/login/login.component').then(
        (m) => m.LoginComponent,
      ),
    title: 'Iniciar sesión — NalunPos',
  },

  // ─── Layout Protegido (Admin Negocio) ─────────────────────────────────────
  {
    path: '',
    component: WebLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.dashboardRoutes,
          ),
        title: 'Dashboard — NalunPos',
      },
      {
        path: 'productos',
        loadChildren: () =>
          import('./features/productos/productos.routes').then(
            (m) => m.productosRoutes,
          ),
        title: 'Productos — NalunPos',
      },
      {
        path: 'ventas',
        loadChildren: () =>
          import('./features/ventas/ventas.routes').then(
            (m) => m.ventasRoutes,
          ),
        title: 'Ventas — NalunPos',
      },
      {
        path: 'inventario',
        loadChildren: () =>
          import('./features/inventario/inventario.routes').then(
            (m) => m.inventarioRoutes,
          ),
        title: 'Inventario — NalunPos',
      },
      {
        path: 'clientes',
        loadChildren: () =>
          import('./features/clientes/clientes.routes').then(
            (m) => m.clientesRoutes,
          ),
        title: 'Clientes — NalunPos',
      },
      {
        path: 'usuarios',
        loadChildren: () =>
          import('./features/usuarios/usuarios.routes').then(
            (m) => m.usuariosRoutes,
          ),
        title: 'Usuarios — NalunPos',
      },
      {
        path: 'categorias',
        loadChildren: () =>
          import('./features/categories/categories.routes').then(
            (m) => m.categoriesRoutes,
          ),
        title: 'Categorías — NalunPos',
      },
    ],
  },

  // ─── Páginas de error ─────────────────────────────────────────────────────
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./shared/components/forbidden/forbidden.component').then(
        (m) => m.ForbiddenComponent,
      ),
    title: 'Acceso denegado — NalunPos',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
    title: 'Página no encontrada — NalunPos',
  },
];
