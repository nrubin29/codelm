import { Component, OnInit, ViewChild } from '@angular/core';
import { ProblemModel } from '@codelm/common/src/models/problem.model';
import { TeamService } from '../../../services/team.service';
import { ProblemService } from '../../../services/problem.service';
import { MatSidenav } from '@angular/material/sidenav';
import { TeamModel } from '@codelm/common/src/models/team.model';
import { SocketService } from '../../../services/socket.service';
import { SubmissionUtil } from '@codelm/common/src/utils/submission.util';
import { SubmissionModel } from '@codelm/common/src/models/submission.model';
import { SubmissionService } from '../../../services/submission.service';
import { StateSwitchPacket } from '@codelm/common/src/packets/server.packet';
import {
  SettingsModel,
  SettingsState,
} from '@codelm/common/src/models/settings.model';
import { Router } from '@angular/router';
import { TeamUtil } from '@codelm/common/src/utils/team.util';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  team: TeamModel;
  private submissions: SubmissionModel[];
  problems: ProblemModel[] = [];
  settings: SettingsModel;

  @ViewChild(MatSidenav) private sideNav: MatSidenav;

  constructor(
    private problemService: ProblemService,
    private teamService: TeamService,
    private submissionService: SubmissionService,
    private socketService: SocketService,
    private settingsService: SettingsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.socketService.on('updateTeam', () => this.teamService.refreshTeam());

    this.settingsService.getSettings().then(settings => {
      this.settings = settings;
    });

    this.teamService.team.subscribe(team => {
      this.team = team;

      this.submissionService.getSubmissions().then(submissions => {
        this.submissions = submissions;

        this.problemService
          .getProblems(this.team.division._id)
          .then(problems => {
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

  setSidenavOpen(open: boolean): Promise<any> {
    if (open && !this.isSidenavOpen) {
      return this.sideNav.open();
    } else if (!open && this.isSidenavOpen) {
      return this.sideNav.close();
    }

    return Promise.resolve();
  }

  get isSidenavOpen() {
    return this.sideNav.opened;
  }

  get teamName() {
    return TeamUtil.getName(this.team);
  }

  didSolve(problem: ProblemModel) {
    return SubmissionUtil.getSolution(problem, this.submissions);
  }
}
