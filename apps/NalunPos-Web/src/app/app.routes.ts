// =============================================================================
// app.routes.ts — NalunPos-Web
// Definición de rutas raíz de la aplicación.
// Lazy loading en todas las features para máxima performance.
// authGuard protege todas las rutas privadas.
// =============================================================================

import { Routes } from '@angular/router';
import { authGuard } from '@nalunpos/shared/auth';

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

  // ─── Rutas protegidas (requieren autenticación) ───────────────────────────
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then(
        (m) => m.dashboardRoutes,
      ),
    title: 'Dashboard — NalunPos',
  },
  {
    path: 'productos',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/productos/productos.routes').then(
        (m) => m.productosRoutes,
      ),
    title: 'Productos — NalunPos',
  },
  {
    path: 'ventas',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/ventas/ventas.routes').then((m) => m.ventasRoutes),
    title: 'Ventas — NalunPos',
  },
  {
    path: 'inventario',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/inventario/inventario.routes').then(
        (m) => m.inventarioRoutes,
      ),
    title: 'Inventario — NalunPos',
  },
  {
    path: 'clientes',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/clientes/clientes.routes').then(
        (m) => m.clientesRoutes,
      ),
    title: 'Clientes — NalunPos',
  },
  {
    path: 'usuarios',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/usuarios/usuarios.routes').then(
        (m) => m.usuariosRoutes,
      ),
    title: 'Usuarios — NalunPos',
  },
  {
    path: 'categorias',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/categories/categories.routes').then(
        (m) => m.categoriesRoutes,
      ),
    title: 'Categorías — NalunPos',
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
