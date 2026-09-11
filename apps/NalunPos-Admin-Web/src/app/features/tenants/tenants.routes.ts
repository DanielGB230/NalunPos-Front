import { Routes } from '@angular/router';

import { TenantListComponent } from './components/tenant-list/tenant-list.component';

export const tenantsRoutes: Routes = [
  {
    path: '',
    component: TenantListComponent,
  },
];
