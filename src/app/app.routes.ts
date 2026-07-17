import { Routes } from '@angular/router';
import { Menu } from './features/pages/menu/menu';
import { Game } from './features/pages/game/game';

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
