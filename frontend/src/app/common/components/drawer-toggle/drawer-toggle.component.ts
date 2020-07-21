import { Component, Optional } from '@angular/core';
import { DashboardComponent } from '../../../competition/views/dashboard/dashboard.component';
import { AdminComponent } from '../../../admin/views/admin/admin.component';

@Component({
  selector: 'app-drawer-toggle',
  templateUrl: './drawer-toggle.component.html',
  styleUrls: ['./drawer-toggle.component.scss'],
})
export class DrawerToggleComponent {
  constructor(
    @Optional() private dashboardComponent: DashboardComponent,
    @Optional() private adminComponent: AdminComponent
  ) {}

  toggle() {
    const component = this.dashboardComponent ?? this.adminComponent;
    component.setSidenavOpen(!component.isSidenavOpen);
  }
}
