import { Component, OnInit } from '@angular/core';
import { AdminModel } from '../../../../../../common/src/models/admin.model';
import { AdminService } from '../../../services/admin.service';
import {DialogResult} from "../../../dialog-result";
import {MatDialog} from "@angular/material";
import {ActivatedRoute} from "@angular/router";
import {EditAdminComponent} from "../../components/edit-admin/edit-admin.component";

@Component({
  selector: 'app-admins',
  templateUrl: './admins.component.html',
  styleUrls: ['./admins.component.scss']
})
export class AdminsComponent implements OnInit {
  admins: AdminModel[] = [];

  constructor(private adminService: AdminService, private activatedRoute: ActivatedRoute, private dialog: MatDialog) { }

  ngOnInit() {
    this.activatedRoute.data.subscribe(data => {
      this.admins = data['admins'];
    });
  }

  edit(admin: AdminModel) {
    const ref = this.dialog.open(EditAdminComponent, {
      data: {
        admin: admin
      },
      disableClose: true
    });

    ref.afterClosed().subscribe((r?: [DialogResult, any]) => {
      if (r) {
        const result = r[0];
        const data = r[1];

        if (result === 'save') {
          this.adminService.addOrUpdateAdmin(data).then(response => {
            // TODO: If this is an error, display it.
            console.log(response);
          }).catch(alert);
        }

        else if (result === 'delete') {
          if (confirm('Are you sure you want to delete this admin?')) {
            this.adminService.deleteAdmin(data._id).then(() => {
            }).catch(alert);
          }
        }
      }
    });
  }
}
