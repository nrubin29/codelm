import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginResponse } from '../../../../../../common/src/packets/login.response.packet';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { DivisionModel } from '../../../../../../common/src/models/division.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  divisions: DivisionModel[];
  formGroup: FormGroup;

  constructor(private authService: AuthService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.formGroup = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      members: new FormControl('', Validators.required),
      division: new FormControl(undefined, Validators.required)
    });

    this.activatedRoute.data.subscribe(data => {
      this.divisions = data['divisions'];
      this.formGroup.controls['division'].setValue(this.divisions[0]._id);
    });
  }

  register(form: NgForm) {
    if (!form.value.username || !form.value.password) {
      alert('Please enter a username and password');
    }

    this.authService.register(form.value).then((response: LoginResponse) => {
      if (response === LoginResponse.SuccessTeam) {
        this.router.navigate(['dashboard']);
      }
    }).catch((response: LoginResponse | Error) => {
      alert(response);
    });
  }

  login() {
    this.router.navigate(['login']);
  }
}