import { Routes } from '@angular/router';
import { Home } from './home/home';
import { EXERCISES } from './registry';

export const routes: Routes = [
  { path: '', title: 'Angular Practice', component: Home },
  {
    path: 'sandbox',
    title: 'Sandbox',
    loadComponent: () => import('./sandbox/sandbox').then((m) => m.Sandbox),
  },
  ...EXERCISES.map((exercise) => ({
    path: `${exercise.category}/${exercise.slug}`,
    title: exercise.title,
    loadComponent: exercise.load,
  })),
  { path: '**', redirectTo: '' },
];
