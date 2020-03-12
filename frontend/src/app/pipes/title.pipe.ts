import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'title'
})
export class TitlePipe implements PipeTransform {
  transform(value: string): string {
    return value[0].toUpperCase() + value.substring(1).replace(/[A-Z]/g, sub => ' ' + sub);
  }
}
