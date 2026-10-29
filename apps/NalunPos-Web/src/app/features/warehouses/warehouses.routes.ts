import type { Routes } from '@angular/router';

export const warehousesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/warehouse-list/warehouse-list.component').then(
        (m) => m.WarehouseListComponent,
      ),
    title: 'Gestión de Almacenes — NalunPos',
  },
];
