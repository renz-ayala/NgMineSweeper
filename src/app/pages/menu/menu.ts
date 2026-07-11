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

  startGame(level: Difficulty): void {
    this.gameConfigService.setConfig(level);
    this.router.navigate(['/game']);
  }
}
