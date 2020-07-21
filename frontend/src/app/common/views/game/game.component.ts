import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  SubmissionCompletedPacket,
  SubmissionStatusPacket,
} from '../../../../../../common/src/packets/server.packet';
import { MatTable } from '@angular/material/table';
import { DashboardComponent } from '../../../competition/views/dashboard/dashboard.component';
import { AdminComponent } from '../../../admin/views/admin/admin.component';
import { ProblemService } from '../../../services/problem.service';
import { TeamService } from '../../../services/team.service';
import { SocketService } from '../../../services/socket.service';
import { VERSION } from '../../../../../../common/version';
import {
  DockerKilledPacket,
  GameTurnPacket,
} from '../../../../../../common/src/packets/coderunner.packet';
import { GameType } from '../../../../../../common/src/models/game.model';
import { ActivatedRoute } from '@angular/router';
import { Packet } from '../../../../../../common/src/packets/packet';

interface LogItem {
  guess: string;
  result: string;
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit, AfterViewInit {
  queue: (
    | SubmissionStatusPacket
    | GameTurnPacket
    | DockerKilledPacket
    | SubmissionCompletedPacket
  )[] = [];
  log: LogItem[] = [];

  gameType: GameType;
  status = 'Preparing';
  error: string;
  score: number;
  _id: string;

  @ViewChild('htmlLog', { static: true }) htmlLog: ElementRef<HTMLDivElement>;
  @ViewChild(MatTable, { static: true }) table: MatTable<object>;

  constructor(
    private route: ActivatedRoute,
    @Optional() private dashboardComponent: DashboardComponent,
    @Optional() private adminComponent: AdminComponent,
    private problemService: ProblemService,
    private teamService: TeamService,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    this.gameType = GameType[this.route.snapshot.params.gameType];
  }

  ngAfterViewInit() {
    const wasSidenavOpen = this.rootComponent.isSidenavOpen;

    this.rootComponent.setSidenavOpen(false).then(() => {
      this.socketService.on<SubmissionStatusPacket>(
        'submissionStatus',
        packet => {
          this.queue.push(packet);
        }
      );

      this.socketService.on<GameTurnPacket>('gameTurn', packet => {
        this.queue.push(packet);
      });

      this.socketService.once<DockerKilledPacket>('dockerKilled', packet => {
        this.queue.push(packet);
      });

      // this.socketService.on<GamePacket>('game', packet => {
      //   // TODO: Show errors correctly.
      //   if (packet.data.hasOwnProperty('error')) {
      //     this.error = packet.data['error'];
      //     this.queue = [];
      //     return;
      //   }
      //
      //   else if (packet.data.hasOwnProperty('input')) {
      //     if (typeof packet.data['input'] == 'object') {
      //       if (packet.data['input'].hasOwnProperty('error')) {
      //         this.error = packet.data['input']['error'];
      //         this.queue = [];
      //         return;
      //       }
      //
      //       else if (packet.data['input'].hasOwnProperty('score')) {
      //         // TODO: Save score if not replay.
      //         this.score = parseInt(packet.data['input']['score']);
      //       }
      //     }
      //   }
      //
      //   this.queue.push(packet);
      // });

      this.socketService.once<SubmissionCompletedPacket>(
        'submissionCompleted',
        packet => {
          this.socketService.off('submissionStatus');
          this.socketService.off('gameTurn');
          this.socketService.off('dockerKilled');
          this.queue.push(packet);
        }
      );

      const interval = setInterval(() => {
        if (this.queue.length > 0) {
          const packet = this.queue.shift();

          if (packet.name === 'submissionCompleted') {
            clearInterval(interval);

            // this.teamService.refreshTeam().then(() => {
            this.rootComponent.setSidenavOpen(wasSidenavOpen).then(() => {
              this.status = 'Finished';
              this._id = packet.submission._id;
              // setTimeout(() => {
              // this.finished = true;
              // this.router.navigate(['dashboard', 'submission', packet._id]);
              // }, 200);
            });
            // });
          } else if (packet.name === 'dockerKilled') {
            clearInterval(interval);

            this.rootComponent.setSidenavOpen(wasSidenavOpen).then(() => {
              this.status = 'Error';
              this.error = packet.reason;
            });
          } else if (packet.name === 'submissionStatus') {
            this.status = packet.status;
          } else if (packet.name === 'gameTurn') {
            this.log.push({
              guess: packet.output,
              result: this.getResultDisplay(packet.input),
            });
            this.table.renderRows();
            this.htmlLog.nativeElement.scrollTop = this.htmlLog.nativeElement.scrollHeight;
          }

          this.onPacketEvaluate(packet);
        }
      }, 500);

      if (this.problemService.peekProblemSubmission) {
        this.socketService.emit({
          name: 'submission',
          submission: this.problemService.problemSubmission,
          team: this.teamService.team.getValue(),
          version: VERSION,
        });
      } else {
        this.socketService.emit({
          name: 'replay',
          replayRequest: this.problemService.replayRequest,
          team: this.teamService.team.getValue(),
          version: VERSION,
        });
      }
    });
  }

  get rootComponent() {
    return this.dashboardComponent ?? this.adminComponent;
  }

  /**
   * This can be modified by a particular game to control how the Result column is displayed.
   */
  getResultDisplay(result: string): string {
    return result;
  }

  /**
   * This can be modified by a particular game to perform custom actions when a packet is being evaluated.
   */
  onPacketEvaluate(packet: Packet) {}
}
