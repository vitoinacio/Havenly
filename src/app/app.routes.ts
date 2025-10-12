import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'reset',
    loadComponent: () =>
      import('./pages/reset/reset.page').then((m) => m.ResetPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'properties',
    loadComponent: () =>
      import('./pages/properties/properties.page').then(
        (m) => m.PropertiesPage
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.page').then((m) => m.ProfilePage),
  },

  {
    path: 'upgrade-plan',
    loadComponent: () =>
      import('./pages/upgrade-plan/upgrade-plan.page').then(
        (m) => m.UpgradePlanPage
      ),
  },
];
