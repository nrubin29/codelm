import { Component, OnInit, ViewChild } from '@angular/core';
import { ProblemModel } from '../../../../../../common/src/models/problem.model';
import { TeamService } from '../../../services/team.service';
import { ProblemService } from '../../../services/problem.service';
import { MatDrawerToggleResult, MatSidenav } from '@angular/material';
import { TeamModel } from '../../../../../../common/src/models/team.model';
import { SocketService } from '../../../services/socket.service';
import { SubmissionUtil } from '../../../../../../common/src/utils/submission.util';
import { SubmissionModel } from '../../../../../../common/src/models/submission.model';
import { SubmissionService } from '../../../services/submission.service';
import {StateSwitchPacket} from "../../../../../../common/src/packets/state.switch.packet";
import {SettingsState} from "../../../../../../common/src/models/settings.model";
import {Router} from "@angular/router";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  team: TeamModel;
  private submissions: SubmissionModel[];
  problems: ProblemModel[] = [];

  @ViewChild(MatSidenav, {static: false}) private sideNav: MatSidenav;

  constructor(private problemService: ProblemService, private teamService: TeamService, private submissionService: SubmissionService, private socketService: SocketService, private router: Router) { }

  ngOnInit() {
    this.socketService.on('updateTeam', () => this.teamService.refreshTeam());

    this.teamService.team.subscribe(team => {
      this.team = team;

      this.submissionService.getSubmissions().then(submissions => {
        this.submissions = submissions;

        this.problemService.getProblems(this.team.division._id).then(problems => {
          this.problems = problems;
        });
      });
    });

    this.socketService.on<StateSwitchPacket>('stateSwitch', packet => {
      switch (packet.newState) {
        case SettingsState.End:
          this.socketService.offAll();
          this.router.navigate(['/end']);
          break;
        case SettingsState.Closed:
          this.socketService.offAll();
          this.router.navigate(['/login']);
          break;
      }
    });
  }

  toggle(): Promise<MatDrawerToggleResult> {
    return this.sideNav.toggle();
  }

  didSolve(problem: ProblemModel) {
    return SubmissionUtil.getSolution(problem, this.submissions);
  }
}
