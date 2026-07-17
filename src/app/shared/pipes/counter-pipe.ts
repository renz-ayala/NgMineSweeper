import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'counter',
})
export class CounterPipe implements PipeTransform {
  transform(value: number): string {
    if (!value || value < 0) {
      return '000';
    }
    if (value >= 999) {
      return '999';
    }
    return Math.abs(value).toString().padStart(3, '0');
  }
}
