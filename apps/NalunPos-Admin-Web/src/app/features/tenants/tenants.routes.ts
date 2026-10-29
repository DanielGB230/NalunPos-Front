import type { Routes } from '@angular/router';

import { TenantListComponent } from './pages/tenant-list/tenant-list.component';

export const tenantsRoutes: Routes = [
  {
    path: '',
    component: TenantListComponent,
  },
];
