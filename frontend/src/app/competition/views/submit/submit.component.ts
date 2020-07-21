import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { ProblemService } from '../../../services/problem.service';
import { ClientProblemSubmission } from '../../../../../../common/src/problem-submission';
import { TeamService } from '../../../services/team.service';
import { SocketService } from '../../../services/socket.service';
import { VERSION } from '../../../../../../common/version';
import {
  SubmissionCompletedPacket,
  SubmissionStatusPacket,
} from '../../../../../../common/src/packets/server.packet';

@Component({
  selector: 'app-submit',
  templateUrl: './submit.component.html',
  styleUrls: ['./submit.component.scss'],
})
export class SubmitComponent implements OnInit {
  problemSubmission: ClientProblemSubmission;
  animation: number;
  finished: boolean;

  constructor(
    private dashboard: DashboardComponent,
    private problemService: ProblemService,
    private socketService: SocketService,
    private teamService: TeamService,
    private router: Router
  ) {}

  ngOnInit() {
    this.finished = false;
    this.problemSubmission = this.problemService.problemSubmission;
    this.animation = Math.floor(Math.random() * 12);
    const wasSidenavOpen = this.dashboard.isSidenavOpen;

    this.dashboard.setSidenavOpen(false).then(() => {
      this.socketService.on<SubmissionStatusPacket>(
        'submissionStatus',
        packet => {
          console.log(packet.status);
        }
      );

      this.socketService.once<SubmissionCompletedPacket>(
        'submissionCompleted',
        packet => {
          this.socketService.off('submissionStatus');

          this.teamService.refreshTeam().then(() => {
            this.dashboard.setSidenavOpen(wasSidenavOpen).then(() => {
              // setTimeout(() => {
              this.finished = true;
              this.router.navigate(
                ['dashboard', 'submission', packet.submission._id || 'test'],
                { state: { submission: packet.submission } }
              );
              // }, 200);
            });
          });
        }
      );

      this.socketService.emit({
        name: 'submission',
        submission: this.problemSubmission,
        team: this.teamService.team.getValue(),
        version: VERSION,
      });
    });
  }
}
