import { computed, Injectable, signal } from '@angular/core';
import { environment} from '../../../environments/environment';

export type Lang = 'en' | 'es';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  currentLang = signal<Lang>(
    (localStorage.getItem('game_lang') as Lang) || (environment.defaultLang as Lang),
  );

  i18n = computed(() => environment.i18n[this.currentLang()]);

  toggleLanguage() {
    const nextLang: Lang = this.currentLang() === 'en' ? 'es' : 'en';
    this.currentLang.set(nextLang);
    localStorage.setItem('game_lang', nextLang);
  }

  getTranslation(key: string) {
    const keys = key.split('.');
    let result: any = this.i18n();

    for (const key of keys) {
      if (result && result[key] !== undefined) {
        result = result[key];
      } else {
        return key;
      }
    }

    return result;
  }

  getRandomMessage(isGameOver: boolean) {
    const langData = this.i18n();
    const list = isGameOver ? langData.lossMessages : langData.winMessages;
    const index = Math.floor(Math.random() * list.length);
    return list[index];
  }
}

