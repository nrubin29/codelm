import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { SingleEntityService } from './entity.service';
import { GroupModel } from '../../../../common/src/models/group.model';

@Injectable({
  providedIn: 'root',
})
export class GroupService extends SingleEntityService<GroupModel> {
  private endpoint = 'groups';

  constructor(private restService: RestService) {
    super({
      entityName: 'group',
      columns: [{ name: 'name', isEditColumn: true }],
      attributes: [
        { name: '_id', readonly: true, optional: true },
        { name: 'name' },
      ],
      editable: true,
    });
  }

  getAll(): Promise<GroupModel[]> {
    return this.restService.get<GroupModel[]>(this.endpoint);
  }

  addOrUpdate(group: GroupModel): Promise<GroupModel> {
    return this.restService.put<GroupModel>(this.endpoint, group);
  }

  delete(group: GroupModel): Promise<void> {
    return this.restService.delete<void>(`${this.endpoint}/${group._id}`);
  }

  getName(entity: Partial<GroupModel>) {
    return entity.name;
  }
}
