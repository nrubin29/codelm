import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { GroupedEntityService } from './entity.service';
import {
  PersonExperience,
  PersonModel,
  PersonYear,
} from '@codelm/common/src/models/person.model';
import { GroupService } from './group.service';
import { GroupModel } from '@codelm/common/src/models/group.model';

@Injectable({
  providedIn: 'root',
})
export class PersonService extends GroupedEntityService<
  PersonModel,
  GroupModel
> {
  private endpoint = 'people';

  constructor(
    private restService: RestService,
    private groupService: GroupService
  ) {
    super({
      entityName: 'person',
      columns: [
        { name: 'name', isEditColumn: true },
        { name: 'email' },
        { name: 'username' },
      ],
      attributes: [
        { name: '_id', readonly: true, optional: true },
        { name: 'name' },
        { name: 'email', type: 'email' },
        { name: 'username' },
        { name: 'password', type: 'password', optional: true },
        { name: 'year', type: 'select', options: Object.values(PersonYear) },
        {
          name: 'experience',
          type: 'select',
          options: Object.values(PersonExperience),
        },
        {
          name: 'group',
          type: 'select',
          options: () =>
            this.groupService.getAll().then(groups =>
              groups.map(group => ({
                name: group.name,
                value: group._id.toString(),
              }))
            ),
        },
        { name: 'photoRelease', type: 'boolean' },
        { name: 'addressRelease', type: 'boolean' },
        { name: 'addressLine1', optional: true },
        { name: 'addressLine2', optional: true },
        { name: 'city', optional: true },
        { name: 'state', optional: true },
        { name: 'zipCode', optional: true },
      ],
      editable: true,
    });
  }

  getParents(): Promise<GroupModel[]> {
    return this.groupService.getAll();
  }

  getChildren(parent: GroupModel): Promise<PersonModel[]> {
    return this.restService.get<PersonModel[]>(
      `${this.endpoint}/group/${parent._id}`
    );
  }

  getAll(): Promise<PersonModel[]> {
    return this.restService.get<PersonModel[]>(this.endpoint);
  }

  addOrUpdate(person: PersonModel): Promise<PersonModel> {
    return this.restService.put<PersonModel>(this.endpoint, person);
  }

  delete(person: PersonModel): Promise<void> {
    return this.restService.delete<void>(`${this.endpoint}/${person._id}`);
  }

  getName(entity: Partial<PersonModel>) {
    return entity.name;
  }

  getGroupLabel(parent: GroupModel): string {
    return parent.name;
  }
}
