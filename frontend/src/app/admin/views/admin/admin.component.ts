import { Component, OnInit, ViewChild } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { AdminModel } from '../../../../../../common/src/models/admin.model';
import { MatDrawerToggleResult, MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  admin: AdminModel;

  @ViewChild(MatSidenav) private sideNav: MatSidenav;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.admin.subscribe(admin => {
      this.admin = admin;
    });
  }

  setSidenavOpen(open: boolean): Promise<any> {
    if (open && !this.isSidenavOpen) {
      return this.sideNav.open();
    } else if (!open && this.isSidenavOpen) {
      return this.sideNav.close();
    }

    return Promise.resolve();
  }

  get isSidenavOpen() {
    return this.sideNav.opened;
  }
}
