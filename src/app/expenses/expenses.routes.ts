import { Routes } from '@angular/router';
import { ExpenseListComponent } from './expense-list/expense-list.component';

export const expensesRoutes: Routes = [
  {
    path: '',
    component: ExpenseListComponent
  }
];
