import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () =>
      import('./shared/ui/auth-layout/auth-layout.component'),
    children: [
      {
        path: '',
        loadChildren: () => import('./auth/auth.routes'),
      },
    ],
  },
  {
    path: '',
    loadComponent: () => import('./shared/ui/layout/layout.component'),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component'),
      },
      {
        path: 'tasks',
        loadChildren: () => import('./tasks/tasks.routes'),
      },
      {
        path: 'users',
        loadChildren: () => import('./admin/user.routes'),
      },
      {
        path: '**',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
];
