import { Injectable } from '@angular/core';
import { TeamModel } from '../../../../common/src/models/team.model';
import { RestService } from './rest.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private endpoint = 'teams';
  team: BehaviorSubject<TeamModel>;

  constructor(private restService: RestService) {
    this.team = new BehaviorSubject<TeamModel>(null);
  }

  refreshTeam(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.restService.get<TeamModel>(this.endpoint).then(team => {
        this.team.next(team);
        resolve();
      }).catch(reject);
    });
  }

  getTeam(id: string): Promise<TeamModel> {
    return this.restService.get<TeamModel>(`${this.endpoint}/${id}`)
  }

  getTeamsForDivision(divisionId: string): Promise<TeamModel[]> {
    return this.restService.get<TeamModel[]>(`${this.endpoint}/division/${divisionId}`);
  }

  addOrUpdateTeam(team: any): Promise<TeamModel> {
    return this.restService.put<TeamModel>(this.endpoint, team);
  }

  deleteTeam(teamId: string): Promise<void> {
    return this.restService.delete<void>(`${this.endpoint}/${teamId}`);
  }
}
