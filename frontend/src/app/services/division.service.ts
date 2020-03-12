import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import {DivisionModel, DivisionType} from '../../../../common/src/models/division.model';
import {SingleEntityService} from "./entity.service";
import {SettingsState} from "../../../../common/src/models/settings.model";

@Injectable({
  providedIn: 'root'
})
export class DivisionService extends SingleEntityService<DivisionModel> {
  private endpoint = 'divisions';

  constructor(private restService: RestService) {
    super({
      entityName: 'division',
      columns: [
        {name: 'name', isEditColumn: true},
        {name: 'type'}
      ],
      attributes: [
        {name: '_id', readonly: true, optional: true},
        {name: 'name'},
        {name: 'type', type: 'select', options: Object.keys(DivisionType).map(type => DivisionType[type])},
        {name: 'starterCode', type: 'table', columns: [
          {name: 'state', type: 'select', options: Object.keys(SettingsState).map(type => SettingsState[type])},
          {name: 'file', type: 'file'},
        ]}
      ],
      editable: true,
    });
  }

  getAll(): Promise<DivisionModel[]> {
    return this.restService.get<DivisionModel[]>(this.endpoint);
  }

  addOrUpdate(division: DivisionModel): Promise<DivisionModel> {
    const formData = new FormData();

    for (let starterCode of division.starterCode) {
      if (starterCode.file && typeof starterCode.file === 'object') {
        formData.append(starterCode.state.toString(), starterCode.file as File, (starterCode.file as File).name);
      }
    }

    for (const key of Object.keys(division).filter(key => key !== 'starterCode' && division[key])) {
      formData.append(key, division[key]);
    }

    for (let starterCode of division.starterCode) {
      formData.append('states[]', starterCode.state);
    }

    delete division.starterCode;

    console.log(formData);

    return this.restService.put<DivisionModel>(this.endpoint, formData);
  }

  delete(division: DivisionModel): Promise<void> {
    return this.restService.delete<void>(`${this.endpoint}/${division._id}`);
  }

  getName(entity: DivisionModel) {
    return entity.name;
  }
}
