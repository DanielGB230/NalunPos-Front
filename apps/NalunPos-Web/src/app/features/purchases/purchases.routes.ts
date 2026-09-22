import { Routes } from '@angular/router';

export const purchasesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/purchase-order-list/purchase-order-list.component').then(
        (m) => m.PurchaseOrderListComponent
      ),
  },
];
