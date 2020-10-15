import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { PersonModel } from '@codelm/common/src/models/person.model';
import { PersonService } from '../services/person.service';

@Injectable({
  providedIn: 'root',
})
export class PersonsResolve implements Resolve<PersonModel[]> {
  constructor(private personService: PersonService) {}

  resolve(route: ActivatedRouteSnapshot): Promise<PersonModel[]> {
    return this.personService.getAll();
  }
}
