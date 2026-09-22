// =============================================================================
// inventario.routes.ts — NalunPos-Web / features/inventario
// Rutas del módulo de inventario. El Shell se carga de forma lazy.
// =============================================================================

import { Routes } from '@angular/router';

export const inventarioRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/inventario-shell/inventario-shell.component').then(
        (m) => m.InventarioShellComponent
      ),
  },
];
