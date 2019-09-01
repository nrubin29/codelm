import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { TeamModel } from '../../../../common/src/models/team.model';
import { TeamService } from '../services/team.service';
import { ProblemModel } from '../../../../common/src/models/problem.model';
import { ProblemService } from '../services/problem.service';

@Injectable({
  providedIn: 'root'
})
export class TeamResolve implements Resolve<[TeamModel, ProblemModel[]]> {
  constructor(private teamService: TeamService, private problemService: ProblemService) {}

  resolve(route: ActivatedRouteSnapshot): Promise<[TeamModel, ProblemModel[]]> {
    return new Promise<[TeamModel,ProblemModel[]]>((resolve, reject) => {
      this.teamService.getTeam(route.paramMap.get('id')).then(team => {
        this.problemService.getProblems(team.division._id).then(problems => {
          resolve([team, problems]);
        });
      }).catch(reject);
    });
  }
}
