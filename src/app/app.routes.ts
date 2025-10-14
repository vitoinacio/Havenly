import { Routes } from '@angular/router';
import { AuthGuard } from './services/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Public routes
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
  

  // Protected routes
  {
    path: 'home',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'properties',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/properties/properties.page').then(
        (m) => m.PropertiesPage
      ),
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/profile/profile.page').then((m) => m.ProfilePage),
  },

  {
    path: 'upgrade-plan',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/upgrade-plan/upgrade-plan.page').then(
        (m) => m.UpgradePlanPage
      ),
  },
  {
    path: 'my-account',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/profile/my-account/my-account.page').then(
        (m) => m.MyAccountPage
      ),
  },
  {
    path: 'notifications',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/profile/notifications/notifications.page').then(
        (m) => m.NotificationsPage
      ),
  },
  {
    path: 'security',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/profile/security/security.page').then(
        (m) => m.SecurityPage
      ),
  },
  {
    path: 'help-support',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/profile/help-support/help-support.page').then(
        (m) => m.HelpSupportPage
      ),
  },
  {
    path: 'two-mfa',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/profile/security/two-mfa/two-mfa.page').then(
        (m) => m.TwoMFAPage
      ),
  },
  {
    path: 'change-password',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import(
        './pages/profile/security/change-password/change-password.page'
      ).then((m) => m.ChangePasswordPage),
  },
  {
    path: 'propertie-details/:id',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import(
        './pages/properties/propertie-details/propertie-details.page'
      ).then((m) => m.PropertieDetailsPage),
  },
];
