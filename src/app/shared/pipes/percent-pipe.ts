import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'percent',
})
export class PercentPipe implements PipeTransform {
  transform(value: number): string {
    if (value == null || isNaN(value)) {
      return '0%'
    }

    return `${Number(value).toFixed(2)}%`;
  }
}
