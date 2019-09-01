import {AfterViewInit, Component, ElementRef, OnInit, Optional, ViewChild} from '@angular/core';
import {DashboardComponent} from "../../../competition/views/dashboard/dashboard.component";
import {SubmissionStatusPacket} from "../../../../../../common/src/packets/submission.status.packet";
import {SubmissionCompletedPacket} from "../../../../../../common/src/packets/submission.completed.packet";
import {SubmissionPacket} from "../../../../../../common/src/packets/submission.packet";
import {VERSION} from "../../../../../../common/version";
import {SocketService} from "../../../services/socket.service";
import {ProblemService} from "../../../services/problem.service";
import {TeamService} from "../../../services/team.service";
import {GamePacket} from "../../../../../../common/src/packets/game.packet";
import {MatTable} from "@angular/material";
import {isPacket} from "../../../../../../common/src/packets/packet";
import {ReplayPacket} from "../../../../../../common/src/packets/replay.packet";
import {AdminComponent} from "../../../admin/views/admin/admin.component";

@Component({
  selector: 'app-highlow',
  templateUrl: './highlow.component.html',
  styleUrls: ['./highlow.component.scss']
})
export class HighlowComponent implements AfterViewInit {
  queue: (SubmissionStatusPacket | GamePacket | SubmissionCompletedPacket)[] = [];
  log: object[] = [];

  status = 'Preparing';
  error: string;
  score: number;
  _id: string;

  @ViewChild('htmlLog', {static: true}) htmlLog: ElementRef<HTMLDivElement>;
  @ViewChild(MatTable, {static: true}) table: MatTable<object>;

  constructor(@Optional() private dashboardComponent: DashboardComponent, @Optional() private adminComponent: AdminComponent, private problemService: ProblemService, private teamService: TeamService, private socketService: SocketService) { }

  ngAfterViewInit() {
    this.toggle().then(() => {
      this.socketService.on<SubmissionStatusPacket>('submissionStatus', packet => {
        this.queue.push(packet);
      });

      this.socketService.on<GamePacket>('game', packet => {
        // TODO: Show errors correctly.
        if (packet.data.hasOwnProperty('error')) {
          this.error = packet.data['error'];
          this.queue = [];
          return;
        }

        else if (packet.data.hasOwnProperty('input')) {
          if (typeof packet.data['input'] == 'object') {
            if (packet.data['input'].hasOwnProperty('error')) {
              this.error = packet.data['input']['error'];
              this.queue = [];
              return;
            }

            else if (packet.data['input'].hasOwnProperty('score')) {
              // TODO: Save score if not replay.
              this.score = parseInt(packet.data['input']['score']);
            }
          }

          else {
            packet.data['input'] = packet.data['input'] === '1' ? 'Too high' : packet.data['input'] === '-1' ? 'Too low': packet.data['input'] === '0' ? 'Correct' : packet.data['input'];
          }
        }

        this.queue.push(packet);
      });

      this.socketService.once<SubmissionCompletedPacket>('submissionCompleted', packet => {
        this.socketService.off('submissionStatus');
        this.socketService.off('game');
        this.queue.push(packet);
      });

      const interval = setInterval(() => {
        if (this.queue.length > 0) {
          const packet = this.queue.shift();

          if (isPacket<SubmissionCompletedPacket>(packet, 'submissionCompleted')) {
            clearInterval(interval);

            // this.teamService.refreshTeam().then(() => {
            this.toggle().then(() => {
              this.status = 'Finished';
              this._id = packet._id;
              // setTimeout(() => {
              // this.finished = true;
              // this.router.navigate(['dashboard', 'submission', packet._id]);
              // }, 200);
            });
            // });
          }

          else if (isPacket<SubmissionStatusPacket>(packet, 'submissionStatus')) {
            this.status = packet.status;
          }

          else if (typeof packet.data['input'] === 'string') {
            this.log.push(packet.data);
            this.table.renderRows();
            this.htmlLog.nativeElement.scrollTop = this.htmlLog.nativeElement.scrollHeight;
          }
        }
      }, 500);

      if (this.problemService.peekProblemSubmission) {
        this.socketService.emit(new SubmissionPacket(this.problemService.problemSubmission, this.teamService.team.getValue(), VERSION));
      }

      else {
        this.socketService.emit(new ReplayPacket(this.problemService.replayRequest, this.teamService.team.getValue(), VERSION));
      }
    });
  }

  private toggle(): Promise<any> {
    if (this.dashboardComponent) {
      return this.dashboardComponent.toggle();
    }

    else if (this.adminComponent) {
      return this.adminComponent.toggle();
    }

    return Promise.resolve();
  }
}
