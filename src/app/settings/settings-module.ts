import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent),
    title: 'Settings'
  },
  {
    path: 'company',
    loadComponent: () => import('./company-settings/company-settings.component').then(m => m.CompanySettingsComponent),
    title: 'Company Settings'
  },
  {
    path: 'features',
    loadComponent: () => import('./feature-toggles/feature-toggles.component').then(m => m.FeatureTogglesComponent),
    title: 'Feature Toggles'
  }
];

export default routes;
