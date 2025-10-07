import { Routes } from '@angular/router';
import { HomePage } from './home/home.page';




export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
   {
    path: 'add-property',
    loadComponent: () =>
      import('./home/add-property/add-property.page').then(m => m.AddPropertyPage),
  },

  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  { path: 'register', loadComponent: () => import('./register/register.page').then(m => m.RegisterPage) },
  { path: 'reset', loadComponent: () => import('./reset/reset.page').then(m => m.ResetPage) },
];
