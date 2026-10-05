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
  ...EXERCISES.flatMap((exercise) => {
    const base = `${exercise.category}/${exercise.slug}`;
    return [base, ...(exercise.extraPaths ?? []).map((extra) => `${base}/${extra}`)].map(
      (path) => ({ path, title: exercise.title, loadComponent: exercise.load }),
    );
  }),
  { path: '**', redirectTo: '' },
];
