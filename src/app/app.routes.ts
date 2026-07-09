import { Routes } from '@angular/router';
import { Menu } from './pages/menu/menu';
import { Game } from './pages/game/game';

export const routes: Routes = [
  {
    path: '',
    component: Menu
  },
  {
    path: 'game',
    component: Game
  },
  {
    path: '**',
    redirectTo: ''
  }
];
