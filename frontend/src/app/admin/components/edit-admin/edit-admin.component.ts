import {Component, Inject, Input, OnInit} from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { AdminModel } from '../../../../../../common/src/models/admin.model';
import { AdminService } from '../../../services/admin.service';
import { AdminsComponent } from '../../views/admins/admins.component';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {EditProblemComponent} from "../edit-problem/edit-problem.component";
import {DivisionModel} from "../../../../../../common/src/models/division.model";

@Component({
  selector: 'app-edit-admin',
  templateUrl: './edit-admin.component.html',
  styleUrls: ['./edit-admin.component.scss']
})
export class EditAdminComponent implements OnInit {
  admin: AdminModel;

  formGroup: FormGroup;
  originalPassword: string;

  constructor(private adminService: AdminService, private dialogRef: MatDialogRef<EditProblemComponent>, @Inject(MAT_DIALOG_DATA) private data: {admin: AdminModel}) { }

  ngOnInit() {
    this.admin = this.data.admin ? this.data.admin : {_id: undefined, name: undefined, superUser: false, username: undefined, password: undefined, salt: undefined};
    this.originalPassword = this.admin.password;

    this.formGroup = new FormGroup({
      _id: new FormControl(this.admin._id),
      name: new FormControl(this.admin.name),
      superUser: new FormControl(this.admin.superUser),
      username: new FormControl(this.admin.username),
      password: new FormControl('', Validators.required)
    });
  }

  get formValue() {
    return this.formGroup.getRawValue();
  }
}
