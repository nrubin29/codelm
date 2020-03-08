import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { DivisionModel } from '../../../../common/src/models/division.model';
import {SingleEntityService} from "./entity.service";
import {EditDivisionComponent} from "../admin/components/edit-division/edit-division.component";

@Injectable({
  providedIn: 'root'
})
export class DivisionService implements SingleEntityService {
  private endpoint = 'divisions';

  constructor(private restService: RestService) { }

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

  // SECTION: SingleEntitySevice

  columns = [{name: 'name', isEditColumn: true}, 'type'];
  title = 'Divisions';
  editComponent = EditDivisionComponent;
  type = 'single' as const;
}
