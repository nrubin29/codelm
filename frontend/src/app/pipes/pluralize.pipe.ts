import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pluralize',
})
export class PluralizePipe implements PipeTransform {
  private overrides: { [singular: string]: string } = {
    person: 'people',
  };

  transform(value: string, num?: number): string {
    if (num !== 1) {
      return this.overrides[value.toLowerCase()] ?? value + 's';
    }

    return value;
  }
}
