import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginResponseType } from '@codelm/common/src/models/auth.model';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { SettingsModel } from '@codelm/common/src/models/settings.model';
import { VERSION } from '@codelm/common/version';
import { MatDialog } from '@angular/material/dialog';
import { AllCodeComponent } from '../../components/all-code/all-code.component';
import { DialogComponent } from '../../components/dialog/dialog.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  formGroup: FormGroup;
  settings: SettingsModel;

  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.formGroup = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });

    this.activatedRoute.data.subscribe(data => {
      this.settings = data['settings'];
    });
  }

  async login(form: NgForm) {
    if (!form.value.username || !form.value.password) {
      DialogComponent.showError(
        this.dialog,
        'Please enter a username and password.'
      );
      return;
    }

    try {
      const response = await this.authService.login(
        form.value.username,
        form.value.password
      );

      if (response === LoginResponseType.SuccessAdmin) {
        await this.router.navigate(['admin']);
      } else if (response === LoginResponseType.SuccessTeam) {
        await this.router.navigate(['dashboard']);
      }
    } catch (e) {
      DialogComponent.showError(this.dialog, e);
    }
  }

  register() {
    this.router.navigate(['register']);
  }

  showAllCode() {
    this.dialog.open(AllCodeComponent, {
      width: '90vw',
      height: '90vh',
    });
  }

  get version() {
    return VERSION;
  }
}
