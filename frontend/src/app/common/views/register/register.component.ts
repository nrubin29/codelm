import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PersonService } from '../../../services/person.service';
import { DialogResult } from '../../components/edit-entity/edit-entity.component';
import { PersonModel } from '../../../../../../common/src/models/person.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  constructor(public personService: PersonService, private router: Router) {}

  action([result, person]: [DialogResult, PersonModel]) {
    if (result === 'save') {
      if (!person.password) {
        alert('Please enter a password');
      } else {
        this.personService
          .addOrUpdate(person)
          .then(() => {
            alert('Registration successful!');
            this.login();
          })
          .catch(alert);
      }
    }
  }

  login() {
    this.router.navigate(['login']);
  }
}
