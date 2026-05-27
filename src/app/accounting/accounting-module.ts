import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./chart-of-accounts/chart-of-accounts.component').then(m => m.ChartOfAccountsComponent),
    title: 'Chart of Accounts'
  },
  {
    path: 'ledger',
    loadComponent: () => import('./general-ledger/general-ledger.component').then(m => m.GeneralLedgerComponent),
    title: 'General Ledger'
  },
  {
    path: 'trial-balance',
    loadComponent: () => import('./reports/trial-balance/trial-balance.component').then(m => m.TrialBalanceComponent),
    title: 'Trial Balance'
  },
  {
    path: 'profit-loss',
    loadComponent: () => import('./reports/profit-loss/profit-loss.component').then(m => m.ProfitLossComponent),
    title: 'Profit & Loss'
  },
  {
    path: 'balance-sheet',
    loadComponent: () => import('./reports/balance-sheet/balance-sheet.component').then(m => m.BalanceSheetComponent),
    title: 'Balance Sheet'
  }
];

export default routes;
