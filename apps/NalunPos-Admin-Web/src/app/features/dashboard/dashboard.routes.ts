import { Routes } from '@angular/router';
import { DashboardOverviewComponent } from './components/dashboard-overview/dashboard-overview.component';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardOverviewComponent,
  },
  // TODO: Agregar rutas del feature 'dashboard'
];
