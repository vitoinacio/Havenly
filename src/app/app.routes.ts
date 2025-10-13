import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

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
  {
    path: 'my-account',
    loadComponent: () => import('./pages/profile/my-account/my-account.page').then( m => m.MyAccountPage)
  },
  {
    path: 'notifications',
    loadComponent: () => import('./pages/profile/notifications/notifications.page').then( m => m.NotificationsPage)
  },
  {
    path: 'security',
    loadComponent: () => import('./pages/profile/security/security.page').then( m => m.SecurityPage)
  },
  {
    path: 'help-support',
    loadComponent: () => import('./pages/profile/help-support/help-support.page').then( m => m.HelpSupportPage)
  },
  {
    path: 'two-mfa',
    loadComponent: () => import('./pages/profile/security/two-mfa/two-mfa.page').then( m => m.TwoMFAPage)
  },
  {
    path: 'change-password',
    loadComponent: () => import('./pages/profile/security/change-password/change-password.page').then( m => m.ChangePasswordPage)
  },
  {
    path: 'propertie-details/:id',
    loadComponent: () => import('./pages/properties/propertie-details/propertie-details.page').then( m => m.PropertieDetailsPage)
  },
];
