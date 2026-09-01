import { Component, computed, inject, input, output } from '@angular/core';
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

  langService = inject(LanguageService);

  revertCountPlus = computed(() => this.revertCount() + 1);

  confirmExplosion() {
    this.isExplosionCanceled.emit(false);
  }

  cancelExplosion() {
    const crazySdk = (window as any).CrazyGames?.SDK;

    if (crazySdk?.ad) {
      crazySdk.ad.requestAd('rewarded', {
        adFinished: () => {
          this.isExplosionCanceled.emit(true);
        },
        adError: () => {
          this.isExplosionCanceled.emit(false);
        },
      });
    } else {
      this.isExplosionCanceled.emit(true);
    }
  }
}

