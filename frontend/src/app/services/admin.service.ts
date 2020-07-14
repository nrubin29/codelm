import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { BehaviorSubject } from 'rxjs';
import { AdminModel } from '../../../../common/src/models/admin.model';
import { SingleEntityService } from './entity.service';

@Injectable({
  providedIn: 'root',
})
export class AdminService extends SingleEntityService<AdminModel> {
  private endpoint = 'admins';
  admin: BehaviorSubject<AdminModel>;

  constructor(private restService: RestService) {
    super({
      entityName: 'admin',
      columns: [
        { name: 'username', isEditColumn: true },
        { name: 'name' },
        { name: 'superUser', display: 'boolean' },
      ],
      attributes: [
        { name: '_id', readonly: true, optional: true },
        { name: 'username' },
        { name: 'password', type: 'password', optional: true },
        { name: 'name' },
        { name: 'superUser', type: 'boolean', optional: true },
      ],
      editable: true,
    });

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

  getName(entity: Partial<AdminModel>) {
    return entity.username;
  }
}
