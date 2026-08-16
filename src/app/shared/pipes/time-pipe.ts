import { inject, Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '../../core/services/language-service';

@Pipe({
  name: 'time',
})
export class TimePipe implements PipeTransform {
  langService = inject(LanguageService);

  transform(value: number): string {
    if (value == null || isNaN(value) || value < 0) {
      return '--:--';
    }

    const oneDay = 86400;
    if (value >= oneDay) {
      const days = Math.floor(value / oneDay);

      if (days === 1) {
        return this.langService.i18n().plusOneDay;
      }

      return this.langService.i18n().plusDays.replace('{days}', days.toString());
    }

    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;

    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    if (hours > 0) {
      const formattedHours = hours.toString().padStart(2, '0');
      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }

    return `${formattedMinutes}:${formattedSeconds}`;
  }
}
