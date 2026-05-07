// import { Routes } from '@angular/router';
// import { authGuard } from './core/guards/auth-guard';
// import { AppLayoutComponent } from './shared/layout/layout';

// // export const routes: Routes = [
// //   {
// //     path: '',
// //     redirectTo: 'dashboard',
// //     pathMatch: 'full'
// //   },
// //   {
// //     path: 'auth',
// //     loadChildren: () =>
// //       import('./auth/auth.module').then(m => m.AuthModule)
// //   },
// //   {
// //     path: 'dashboard',
// //     canActivate: [authGuard],
// //     loadChildren: () =>
// //       import('./dashboard/dashboard.module').then(m => m.DashboardModule)
// //   },
// //   {
// //     path: 'invoices',
// //     canActivate: [authGuard],
// //     loadChildren: () =>
// //       import('./invoices/invoices.module').then(m => m.InvoicesModule)
// //   },
// //   {
// //     path: '**',
// //     redirectTo: 'dashboard'
// //   }
// // ];

// export const routes: Routes = [
//   {
//     path: '',
//     redirectTo: 'dashboard',
//     pathMatch: 'full'
//   },
//   {
//     path: 'auth',
//     loadChildren: () =>
//       import('./auth/auth.module').then(m => m.AuthModule)
//   },
//   {
//     path: '',
//     component: AppLayoutComponent,
//     canActivate: [authGuard],
//     children: [
//       // { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
//       // {
//       //   path: 'dashboard',
//       //   loadChildren: () =>
//       //   import('./dashboard/dashboard.module').then(m => m.DashboardModule)
//       // },
//       {
//         path: 'dashboard',
//         loadComponent: () =>
//           import('./dashboard/dashboard/dashboard').then(c => c.DashboardComponent)
//       },
//       { 
//         path: 'products', 
//         //loadChildren: () => import('./products/products-module').then(m => m.ProductsModule) 
//         loadChildren: () => import('./products/products-module').then(m => m.ProductsModule)
//       },
//       { 
//         path: 'contacts', 
//         //loadChildren: () => import('./contacts/contacts-module').then(m => m.ContactsModule) 
//         loadChildren: () => import('./contacts/contacts-module').then(m => m.ContactsModule)
//       },
//       { 
//         path: 'stock', 
//         //loadChildren: () => import('./stock/stock-module').then(m => m.StockModule) 
//         loadChildren: () => import('./stock/stock-module').then(m => m.StockModule)
//       },
//       // { 
//       //   path: 'purchases', 
//       //   loadChildren: () => import('./purchases/purchases.module').then(m => m.PurchasesModule) 
//       // },      
//       {
//         path: 'invoices',
//         // loadChildren: () =>
//         //   import('./invoices/invoices.module').then(m => m.InvoicesModule)
//         loadChildren: () =>
//           import('./invoices/invoices.module').then(m => m.InvoicesModule)
//       }
//     ]
//   },
//   { path: '**', redirectTo: 'dashboard' }
// ];

import { Routes } from '@angular/router';
import { AppLayoutComponent } from './shared/layout/layout';
import { authGuard } from './core/guards/auth-guard'; 

export const routes: Routes = [
  // 1. Default Entry Point
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // 2. Public Authentication Routes (Outside the Layout Shell)
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },

  // 3. Secure Application Routes (Inside the Layout Shell)
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      
      // --- STANDALONE COMPONENTS ---
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard/dashboard').then(c => c.DashboardComponent)
      },

      // --- MODULE-BASED FEATURES ---
      { 
        path: 'products', 
        loadChildren: () => import('./products/products-module').then(m => m.ProductsModule) 
      },
      { 
        path: 'contacts', 
        loadChildren: () => import('./contacts/contacts-module').then(m => m.ContactsModule) 
      },
      { 
        path: 'stock', 
        loadChildren: () => import('./stock/stock-module').then(m => m.StockModule) 
      },
      
      // I uncommented Purchases since we built the UI logic for it earlier!
      { 
        path: 'purchase', 
        loadChildren: () => import('./purchase/purchase-module').then(m => m.PurchaseModule) 
      },      
      {
        path: 'invoices',
        loadChildren: () => import('./invoices/invoices.module').then(m => m.InvoicesModule)
      },
      
      // Optional: Add Settings if you generated it earlier
      // {
      //   path: 'settings',
      //   loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule)
      // }
    ]
  },

  // 4. Wildcard Fallback (Catch-all for bad URLs)
  { path: '**', redirectTo: 'dashboard' },
  { path: 'purchase', loadChildren: () => import('./purchase/purchase-module').then(m => m.PurchaseModule)
}
];