import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GameConfigService } from '../../../core/services/game-config-service';
import { PercentPipe } from '../../../shared/pipes/percent-pipe';
import { TimePipe } from '../../../shared/pipes/time-pipe';
import { LanguageService } from '../../../core/services/language-service';
import { SoundService } from '../../../core/services/sound-service';
import { Credits } from '../../../shared/components/credits/credits';

@Component({
  selector: 'app-menu',
  imports: [PercentPipe, TimePipe, Credits],
  templateUrl: './menu.html',
})
export class Menu {
  router = inject(Router);
  gameConfigService = inject(GameConfigService);
  languageService = inject(LanguageService);
  soundService = inject(SoundService);

  selectedDifficulty = signal<Difficulty>(this.gameConfigService.difficulties[0]);
  showCreditsModal = signal(false);

  density = computed(() => {
    return (
      (this.selectedDifficulty().mines /
        (this.selectedDifficulty().rows * this.selectedDifficulty().columns)) *
      100
    );
  });

  bestScore = computed(() =>
    this.gameConfigService.recoverBestScore(this.selectedDifficulty().level),
  );
  bestTime = computed(() =>
    this.gameConfigService.recoverBestTime(this.selectedDifficulty().level),
  );

  selectDifficulty(difficulty: Difficulty): void {
    this.soundService.playSound('click');
    this.selectedDifficulty.set(difficulty);
  }

  startGame(): void {
    this.soundService.playSound('click');
    this.gameConfigService.setConfig(this.selectedDifficulty());
    this.router.navigate(['/game']);
  }

  openCredits(): void {
    this.soundService.playSound('click');
    this.showCreditsModal.set(true);
  }

  closeCredits(): void {
    this.soundService.playSound('click');
    this.showCreditsModal.set(false);
  }

  protected readonly close = close;
}
