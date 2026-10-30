import type { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard-overview/dashboard-overview.component').then(
        (m) => m.DashboardOverviewComponent,
      ),
  },
  // TODO: Agregar rutas del feature 'dashboard'
];
