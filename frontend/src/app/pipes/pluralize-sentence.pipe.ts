import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pluralizeSentence',
})
export class PluralizeSentencePipe implements PipeTransform {
  transform(num: number, singular: string, plural: string): unknown {
    return (num === 1 ? singular : plural).replace('$$', num.toString());
  }
}
