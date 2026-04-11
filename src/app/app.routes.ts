import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'invoices',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./invoices/invoices.module').then(m => m.InvoicesModule)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];