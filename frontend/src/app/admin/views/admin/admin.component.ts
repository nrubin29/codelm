import {Component, OnInit, ViewChild} from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { AdminModel } from '../../../../../../common/src/models/admin.model';
import {MatDrawerToggleResult, MatSidenav} from "@angular/material";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  admin: AdminModel;

  @ViewChild(MatSidenav, {static: false}) private sideNav: MatSidenav;

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.adminService.admin.subscribe(admin => {
      this.admin = admin;
    });
  }

  toggle(): Promise<MatDrawerToggleResult> {
    return this.sideNav.toggle();
  }
}
