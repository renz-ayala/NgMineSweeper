import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GameConfigService } from '../../../core/services/game-config';
import { PercentPipe } from '../../../shared/pipes/percent-pipe';
import { TimePipe } from '../../../shared/pipes/time-pipe';

@Component({
  selector: 'app-menu',
  imports: [PercentPipe, TimePipe],
  templateUrl: './menu.html',
})
export class Menu {
  router = inject(Router);
  gameConfigService = inject(GameConfigService);

  selectedDifficulty = signal<Difficulty>(this.gameConfigService.difficulties[0]);

  density = computed(() => {
    return (this.selectedDifficulty().mines / (this.selectedDifficulty().rows * this.selectedDifficulty().columns)) * 100;
  });

  bestScore = computed(() => this.gameConfigService.recoverBestScore(this.selectedDifficulty().level));
  bestTime = computed( () => this.gameConfigService.recoverBestTime(this.selectedDifficulty().level));

  selectDifficulty(difficulty: Difficulty): void {
    this.selectedDifficulty.set(difficulty);
  }

  startGame(): void {
    this.gameConfigService.setConfig(this.selectedDifficulty());
    this.router.navigate(['/game']);
  }
}
