import { Routes } from '@angular/router';

export default [
  {
    path: 'list',
    loadComponent: () => import('./pages/task-list/task-list.component'),
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./pages/task-edit/task-edit.component'),
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/task-create/task-create.component'),
  },
  {
    path: 'show/:id',
    loadComponent: () => import('./pages/task-show/task-show.component'),
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
] as Routes;
