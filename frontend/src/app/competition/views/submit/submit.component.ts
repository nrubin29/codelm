import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { ProblemService } from '../../../services/problem.service';
import { ClientProblemSubmission } from '../../../../../../common/src/problem-submission';
import { TeamService } from '../../../services/team.service';
import {SocketService} from "../../../services/socket.service";
import {SubmissionPacket} from "../../../../../../common/src/packets/submission.packet";
import {VERSION} from "../../../../../../common/version";
import {SubmissionStatusPacket} from "../../../../../../common/src/packets/submission.status.packet";
import {SubmissionCompletedPacket} from "../../../../../../common/src/packets/submission.completed.packet";

@Component({
  selector: 'app-submit',
  templateUrl: './submit.component.html',
  styleUrls: ['./submit.component.scss']
})
export class SubmitComponent implements OnInit {
  problemSubmission: ClientProblemSubmission;
  animation: number;
  finished: boolean;

  constructor(private dashboard: DashboardComponent, private problemService: ProblemService, private socketService: SocketService, private teamService: TeamService, private router: Router) { }

  ngOnInit() {
    this.finished = false;
    this.problemSubmission = this.problemService.problemSubmission;
    this.animation = Math.floor(Math.random() * 11);

    this.dashboard.toggle().then(() => {
      this.socketService.on<SubmissionStatusPacket>('submissionStatus', packet => {
        console.log(packet.status);
      });

      this.socketService.once<SubmissionCompletedPacket>('submissionCompleted', packet => {
        this.socketService.off('submissionStatus');

        this.teamService.refreshTeam().then(() => {
          this.dashboard.toggle().then(() => {
            // setTimeout(() => {
              this.finished = true;
              this.router.navigate(['dashboard', 'submission', packet._id]);
            // }, 200);
          });
        });
      });

      this.socketService.emit(new SubmissionPacket(this.problemSubmission, this.teamService.team.getValue(), VERSION));
    });
  }
}
