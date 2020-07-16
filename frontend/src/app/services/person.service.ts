import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { GroupedEntityService } from './entity.service';
import {
  PersonExperience,
  PersonModel,
  PersonYear,
} from '../../../../common/src/models/person.model';
import { GroupService } from './group.service';
import { GroupModel } from '../../../../common/src/models/group.model';

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
      columns: [{ name: 'name', isEditColumn: true }, { name: 'email' }],
      attributes: [
        { name: '_id', readonly: true, optional: true },
        { name: 'name' },
        { name: 'email', type: 'email' },
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
