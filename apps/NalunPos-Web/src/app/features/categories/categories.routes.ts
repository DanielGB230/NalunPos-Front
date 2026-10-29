import type { Routes } from '@angular/router';
import { CategoryListComponent } from './pages/category-list/category-list.component';

export const categoriesRoutes: Routes = [
  {
    path: '',
    component: CategoryListComponent,
  },
];
