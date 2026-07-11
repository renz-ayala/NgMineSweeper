import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GameConfigService } from '../../services/game-config';

@Component({
  selector: 'app-menu',
  imports: [],
  templateUrl: './menu.html',
})
export class Menu {
  router = inject(Router);
  gameConfigService = inject(GameConfigService);

  readonly difficulties: Difficulty[] = [
    { level: 'Easy', rows: 10, columns: 10, mines: 15 },
    { level: 'Medium', rows: 16, columns: 16, mines: 40 },
    { level: 'Hard', rows: 20, columns: 30, mines: 99 },
    { level: 'Random', rows: 0, columns: 0, mines: 0 },
  ];

  startGame(level: Difficulty): void {
    this.gameConfigService.setConfig(level);
    this.router.navigate(['/game']);
  }
}
