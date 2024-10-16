import { Routes } from '@angular/router';

export default [
  {
    path: 'list',
    loadComponent: () => import('./pages/user-list/user-list.component'),
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./pages/user-edit/user-edit.component'),
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/user-create/user-create.component'),
  },
  {
    path: 'show/:id',
    loadComponent: () => import('./pages/user-show/user-show.component'),
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
] as Routes;
