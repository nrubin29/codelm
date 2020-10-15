import { Injectable } from '@angular/core';
import { TeamModel } from '../../../../common/src/models/team.model';
import { RestService } from './rest.service';
import { BehaviorSubject } from 'rxjs';
import { EntityService } from './entity.service';
import { DivisionService } from './division.service';
import { PersonService } from './person.service';
import { TeamUtil } from '../../../../common/src/utils/team.util';

@Injectable({
  providedIn: 'root',
})
export class TeamService extends EntityService<TeamModel> {
  private endpoint = 'teams';
  team: BehaviorSubject<TeamModel>;

  constructor(
    private restService: RestService,
    private divisionService: DivisionService,
    private personService: PersonService
  ) {
    super({
      entityName: 'team',
      attributes: [
        { name: '_id', optional: true, readonly: true },
        {
          name: 'members',
          type: 'multiselect',
          options: () =>
            this.personService.getAll().then(people =>
              people.map(person => ({
                name: person.name,
                value: person._id.toString(),
              }))
            ),
        },
        {
          name: 'division',
          type: 'select',
          options: () =>
            this.divisionService.getAll().then(divisions =>
              divisions.map(division => ({
                name: division.name,
                value: division._id.toString(),
              }))
            ),
          transform: (value?: Partial<TeamModel>) => value?.division?._id,
        },
      ],
    });

    this.team = new BehaviorSubject<TeamModel>(null);
  }

  refreshTeam(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.restService
        .get<TeamModel>(this.endpoint)
        .then(team => {
          this.team.next(team);
          resolve();
        })
        .catch(reject);
    });
  }

  getTeam(id: string): Promise<TeamModel> {
    return this.restService.get<TeamModel>(`${this.endpoint}/${id}`);
  }

  getTeamsForDivision(divisionId: string): Promise<TeamModel[]> {
    return this.restService.get<TeamModel[]>(
      `${this.endpoint}/division/${divisionId}`
    );
  }

  addOrUpdate(team: TeamModel): Promise<TeamModel> {
    return this.restService.put<TeamModel>(this.endpoint, team);
  }

  delete(team: TeamModel): Promise<void> {
    return this.restService.delete<void>(`${this.endpoint}/${team._id}`);
  }

  getName(entity: TeamModel) {
    return TeamUtil.getName(entity);
  }
}
