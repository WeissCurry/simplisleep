import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'leaderboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/leaderboard/leaderboard.component').then((m) => m.LeaderboardComponent)
  },
  {
    path: 'awake',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/awake/awake.component').then((m) => m.AwakeComponent)
  },
  {
    path: 'cards',
    loadComponent: () => import('./pages/cards/cards.component').then((m) => m.CardsComponent)
  },
  {
    path: 'transparency',
    redirectTo: 'leaderboard',
    pathMatch: 'full'
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
