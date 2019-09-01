import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pluralize'
})
export class PluralizePipe implements PipeTransform {
  transform(value: string, num: number): string {
    return value + (num !== 1 ? 's' : '');
  }
}
