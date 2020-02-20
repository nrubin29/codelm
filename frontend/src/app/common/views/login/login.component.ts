import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginResponse } from '../../../../../../common/src/packets/login.response.packet';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { SettingsModel } from '../../../../../../common/src/models/settings.model';
import { VERSION } from '../../../../../../common/version';
import {MatDialog} from "@angular/material/dialog";
import {AllCodeComponent} from "../../components/all-code/all-code.component";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  formGroup: FormGroup;
  settings: SettingsModel;

  constructor(private authService: AuthService, private activatedRoute: ActivatedRoute, private router: Router, private dialog: MatDialog) { }

  ngOnInit() {
    this.formGroup = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });

    this.activatedRoute.data.subscribe(data => {
      this.settings = data['settings'];
    });
  }

  login(form: NgForm) {
    if (!form.value.username || !form.value.password) {
      alert('Please enter a username and password');
      return;
    }

    this.authService.login(form.value.username, form.value.password).then((response: LoginResponse) => {
      if (response === LoginResponse.SuccessAdmin) {
        this.router.navigate(['admin']);
      }

      else if (response === LoginResponse.SuccessTeam) {
        this.router.navigate(['dashboard']);
      }
    }).catch((response: LoginResponse | Error) => {
      alert(response);
    });
  }

  register() {
    this.router.navigate(['register']);
  }

  showAllCode() {
    this.dialog.open(AllCodeComponent, {
      width: '90vw',
      height: '90vh'
    });
  }

  get version() {
    return VERSION;
  }
}
