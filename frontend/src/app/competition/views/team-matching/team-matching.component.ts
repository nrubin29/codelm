import { Component, OnInit } from '@angular/core';
import { TeamMatchingService } from '../../../services/team-matching.service';
import { TeamModel } from '@codelm/common/src/models/team.model';
import { TeamUtil } from '@codelm/common/src/utils/team.util';
import { TeamMatchingResult } from '@codelm/common/src/models/team-matching.model';

@Component({
  selector: 'app-team-matching',
  templateUrl: './team-matching.component.html',
  styleUrls: ['./team-matching.component.scss'],
})
export class TeamMatchingComponent implements OnInit {
  competitionTeam: TeamModel;
  targetTeamId: string;

  constructor(private teamMatchingService: TeamMatchingService) {}

  ngOnInit() {
    this.teamMatchingService.getCompetitionTeam().then(team => {
      this.competitionTeam = team;
    });
  }

  joinTeam() {
    this.teamMatchingService.joinTeam(this.targetTeamId).then(response => {
      if (response.result === TeamMatchingResult.Success) {
        this.competitionTeam = response.team!;
        this.targetTeamId = '';
      }

      alert(response.result);
    });
  }

  get members(): string {
    return TeamUtil.getName(this.competitionTeam);
  }
}
