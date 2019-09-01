import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { DivisionModel } from '../../../../common/src/models/division.model';

@Injectable({
  providedIn: 'root'
})
export class DivisionService {
  private endpoint = 'divisions';

  constructor(private restService: RestService) { }

  getDivisions(): Promise<DivisionModel[]> {
    return this.restService.get<DivisionModel[]>(this.endpoint);
  }

  addOrUpdateDivision(division: DivisionModel): Promise<DivisionModel> {
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

  deleteDivision(divisionId: string): Promise<void> {
    return this.restService.delete<void>(`${this.endpoint}/${divisionId}`);
  }
}
