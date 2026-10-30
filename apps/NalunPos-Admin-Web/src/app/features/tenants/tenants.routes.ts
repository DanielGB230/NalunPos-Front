import type { Routes } from '@angular/router';

export const tenantsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/tenant-list/tenant-list.component').then((m) => m.TenantListComponent),
  },
];
