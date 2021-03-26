import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PersonService } from '../../../services/person.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DialogComponent } from '../../components/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';
import { GroupModel } from '@codelm/common/src/models/group.model';
import { GroupService } from '../../../services/group.service';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  generalInfoForm: FormGroup;
  experienceForm: FormGroup;
  agreementsForm: FormGroup;
  accountForm: FormGroup;

  groups: GroupModel[];

  @ViewChild('stepper') stepper: MatStepper;

  constructor(
    private personService: PersonService,
    private groupService: GroupService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.groups = this.activatedRoute.snapshot.data.groups;

    this.generalInfoForm = new FormGroup({
      name: new FormControl(),
      email: new FormControl(),
      year: new FormControl(),
      group: new FormControl(),
    });

    this.experienceForm = new FormGroup({
      experience: new FormControl(),
    });

    this.agreementsForm = new FormGroup({
      photoRelease: new FormControl(),
      addressRelease: new FormControl(),
      addressLine1: new FormControl(),
      addressLine2: new FormControl(),
      city: new FormControl(),
      state: new FormControl(),
      zipCode: new FormControl(),
    });

    this.accountForm = new FormGroup({
      username: new FormControl(),
      password: new FormControl(),
    });
  }

  get formGroups() {
    return [
      this.generalInfoForm,
      this.experienceForm,
      this.agreementsForm,
      this.accountForm,
    ];
  }

  submit() {
    if (this.formGroups.some(formGroup => formGroup.invalid)) {
      DialogComponent.showError(
        this.dialog,
        'Please finish filling out the form'
      );
      return;
    }

    const person = Object.assign(
      {},
      ...this.formGroups.map(formGroup => formGroup.value)
    );

    this.personService
      .addOrUpdate(person)
      .then(() => {
        this.stepper.steps.forEach(step => {
          step.editable = false;
        });
        this.stepper.next();
      })
      .catch((errorResponse: HttpErrorResponse) => {
        DialogComponent.showError(this.dialog, errorResponse.error);
      });
  }

  login() {
    this.router.navigate(['login']);
  }
}
