import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PersonService } from '../../../services/person.service';
import { DialogResult } from '../../components/edit-entity/edit-entity.component';
import { PersonModel } from '@codelm/common/src/models/person.model';
import { HttpErrorResponse } from '@angular/common/http';
import { DialogComponent } from '../../components/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  constructor(
    public personService: PersonService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  action([result, person]: [DialogResult, PersonModel]) {
    if (result === 'save') {
      if (!person.password) {
        DialogComponent.showError(this.dialog, 'Please enter a password');
      } else {
        this.personService
          .addOrUpdate(person)
          .then(() =>
            DialogComponent.showSuccess(this.dialog, 'Registration successful!')
          )
          .then(() => {
            this.login();
          })
          .catch((errorResponse: HttpErrorResponse) => {
            DialogComponent.showError(this.dialog, errorResponse);
          });
      }
    }
  }

  login() {
    this.router.navigate(['login']);
  }
}
