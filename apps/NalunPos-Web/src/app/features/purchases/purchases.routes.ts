import type { Routes } from '@angular/router';

export const purchasesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/purchase-order-list/purchase-order-list.component').then(
        (m) => m.PurchaseOrderListComponent,
      ),
  },
];
