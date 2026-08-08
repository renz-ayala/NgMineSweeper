import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { environment} from '../../../environments/environment';
import { SoundService } from './sound-service';
import { Title } from '@angular/platform-browser';

export type Lang = 'en' | 'es';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  soundService = inject(SoundService);
  titleService = inject(Title);

  currentLang = signal<Lang>(
    (localStorage.getItem('game_lang') as Lang) || (environment.defaultLang as Lang),
  );

  i18n = computed(() => environment.i18n[this.currentLang()]);

  constructor() {
    effect(() => {
      const title = (this.i18n().appNamePrefix + this.i18n().appNameSuffix) || 'Minesweeper';
      this.titleService.setTitle(title);
    });
  }

  toggleLanguage() {
    this.soundService.playSound('click');
    const nextLang: Lang = this.currentLang() === 'en' ? 'es' : 'en';
    this.currentLang.set(nextLang);
    localStorage.setItem('game_lang', nextLang);
  }

  getRandomMessage(isGameOver: boolean) {
    const langData = this.i18n();
    const list = isGameOver ? langData.lossMessages : langData.winMessages;
    const index = Math.floor(Math.random() * list.length);
    return list[index];
  }
}

