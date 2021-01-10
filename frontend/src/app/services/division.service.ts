import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import {
  DivisionModel,
  DivisionType,
} from '@codelm/common/src/models/division.model';
import { SingleEntityService } from './entity.service';

@Injectable({
  providedIn: 'root',
})
export class DivisionService extends SingleEntityService<DivisionModel> {
  private endpoint = 'divisions';

  constructor(private restService: RestService) {
    super({
      entityName: 'division',
      columns: [{ name: 'name', isEditColumn: true }, { name: 'type' }],
      attributes: [
        { name: '_id', readonly: true, optional: true },
        { name: 'name' },
        {
          name: 'type',
          type: 'select',
          options: Object.values(DivisionType),
        },
      ],
      editable: true,
    });
  }

  getAll(): Promise<DivisionModel[]> {
    return this.restService.get<DivisionModel[]>(this.endpoint);
  }

  addOrUpdate(entity: DivisionModel): Promise<DivisionModel> {
    return this.restService.put<DivisionModel>(this.endpoint, entity);
  }

  delete(division: DivisionModel): Promise<void> {
    return this.restService.delete<void>(`${this.endpoint}/${division._id}`);
  }

  getName(entity: DivisionModel) {
    return entity.name;
  }
}
