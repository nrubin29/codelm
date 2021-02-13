import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { TeamModel } from '@codelm/common/src/models/team.model';
import {
  TeamMatchingRequest,
  TeamMatchingResponse,
} from '@codelm/common/src/models/team-matching.model';

@Injectable({
  providedIn: 'root',
})
export class TeamMatchingService {
  private endpoint = 'team-matching';

  constructor(private restService: RestService) {}

  getCompetitionTeam(): Promise<TeamModel> {
    return this.restService.get<TeamModel>(this.endpoint);
  }

  joinTeam(targetTeamId: string): Promise<TeamMatchingResponse> {
    return this.restService.post<TeamMatchingResponse>(this.endpoint, {
      targetTeamId,
    } as TeamMatchingRequest);
  }
}
