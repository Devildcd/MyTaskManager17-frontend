import { Routes } from '@angular/router';

export default [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component'),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component'),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
] as Routes;
