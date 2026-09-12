import { Routes } from '@angular/router';
import { CategoryListComponent } from './components/category-list/category-list.component';

export const categoriesRoutes: Routes = [
  {
    path: '',
    component: CategoryListComponent,
  },
];
