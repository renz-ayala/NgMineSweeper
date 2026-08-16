import { Component, computed, inject, input, output } from '@angular/core';
import { SoundService } from '../../../core/services/sound-service';
import { LanguageService } from '../../../core/services/language-service';

@Component({
  selector: 'app-detonation-cancel',
  imports: [],
  templateUrl: './detonation-cancel.html',
})
export class DetonationCancel {
  isExplosionCanceled = output<boolean>();
  revertCount = input.required<number>();
  revertLimit = input.required<number>();

  soundService = inject(SoundService);
  langService = inject(LanguageService);

  revertCountPlus = computed(() => this.revertCount() + 1);

  confirmExplosion() {
    this.soundService.playSound('click');
    this.isExplosionCanceled.emit(false);
  }

  cancelExplosion() {
    this.soundService.playSound('click');
    this.isExplosionCanceled.emit(true);
  }
}

