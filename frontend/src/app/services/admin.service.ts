import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { BehaviorSubject } from 'rxjs';
import { AdminModel } from '../../../../common/src/models/admin.model';
import {SingleEntityService} from "./entity.service";
import {EditAdminComponent} from "../admin/components/edit-admin/edit-admin.component";

@Injectable({
  providedIn: 'root'
})
export class AdminService implements SingleEntityService {
  private endpoint = 'admins';
  admin: BehaviorSubject<AdminModel>;

  constructor(private restService: RestService) {
    this.admin = new BehaviorSubject<AdminModel>(null);
  }

  getAll(): Promise<AdminModel[]> {
    return this.restService.get<AdminModel[]>(this.endpoint);
  }

  addOrUpdate(admin: any): Promise<AdminModel> {
    return this.restService.put<AdminModel>(this.endpoint, admin);
  }

  delete(admin: AdminModel): Promise<void> {
    return this.restService.delete<void>(`${this.endpoint}/${admin._id}`);
  }

  // SECTION: SingleEntityService

  columns = [{name: 'username', isEditColumn: true}, 'name', {name: 'superUser', display: 'boolean' as const}];
  editComponent = EditAdminComponent;
  title = 'Admins';
  type = 'single' as const;
}
