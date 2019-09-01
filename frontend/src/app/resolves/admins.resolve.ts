import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import {AdminModel} from "../../../../common/src/models/admin.model";
import {AdminService} from "../services/admin.service";

@Injectable({
  providedIn: 'root'
})
export class AdminsResolve implements Resolve<AdminModel[]> {
  constructor(private adminService: AdminService) {}

  resolve(route: ActivatedRouteSnapshot): Promise<AdminModel[]> {
    return this.adminService.getAdmins();
  }
}
