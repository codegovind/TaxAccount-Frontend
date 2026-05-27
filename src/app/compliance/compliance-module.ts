import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'ewaybill',
    loadComponent: () => import('./ewaybill/ewaybill.component').then(m => m.EwaybillComponent),
    title: 'E-Way Bill'
  }
];

export default routes;
