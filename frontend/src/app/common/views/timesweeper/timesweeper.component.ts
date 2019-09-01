import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  Optional,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {SubmissionStatusPacket} from "../../../../../../common/src/packets/submission.status.packet";
import {GamePacket} from "../../../../../../common/src/packets/game.packet";
import {SubmissionCompletedPacket} from "../../../../../../common/src/packets/submission.completed.packet";
import {MatTable} from "@angular/material";
import {DashboardComponent} from "../../../competition/views/dashboard/dashboard.component";
import {ProblemService} from "../../../services/problem.service";
import {TeamService} from "../../../services/team.service";
import {SocketService} from "../../../services/socket.service";
import {isPacket} from "../../../../../../common/src/packets/packet";
import {SubmissionPacket} from "../../../../../../common/src/packets/submission.packet";
import {VERSION} from "../../../../../../common/version";
import {AdminComponent} from "../../../admin/views/admin/admin.component";
import {ReplayPacket} from "../../../../../../common/src/packets/replay.packet";
import {SubmissionExtrasPacket} from "../../../../../../common/src/packets/submission.extras.packet";
import {TimesweeperExtras, TimesweeperOutputType} from "../../../../../../common/src/models/game.model";

@Component({
  selector: 'app-timesweeper',
  templateUrl: './timesweeper.component.html',
  styleUrls: ['./timesweeper.component.scss']
})
export class TimesweeperComponent implements OnInit, AfterViewInit {
  queue: (SubmissionStatusPacket | GamePacket | SubmissionCompletedPacket)[] = [];
  log: object[] = [];

  status = 'Preparing';
  error: string;
  score: number;
  _id: string;

  @ViewChild('htmlLog', {static: true}) htmlLog: ElementRef<HTMLDivElement>;
  @ViewChild(MatTable, {static: true}) table: MatTable<object>;
  @ViewChild('board', {static: true}) board: ElementRef<HTMLCanvasElement>;
  @ViewChildren('img') images: QueryList<ElementRef<HTMLImageElement>>;

  extras: TimesweeperExtras;
  playerBoard: number[][];

  constructor(@Optional() private dashboardComponent: DashboardComponent, @Optional() private adminComponent: AdminComponent, private problemService: ProblemService, private teamService: TeamService, private socketService: SocketService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.toggle().then(() => {
      this.socketService.once<SubmissionExtrasPacket>('submissionExtras', packet => {
        this.extras = packet.extras;

        this.playerBoard = [];

        for (let i = 0; i < this.extras.boardSize; i++) {
          this.playerBoard.push(new Array(this.extras.boardSize).fill(-1));
        }
      });

      this.socketService.on<SubmissionStatusPacket>('submissionStatus', packet => {
        this.queue.push(packet);
      });

      this.socketService.on<GamePacket>('game', packet => {
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
              this.score = parseInt(packet.data['input']['score']);
              packet.data['input'] = 'Correct';
            }
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

          else {
            if (packet.data.hasOwnProperty('input') && packet.data['input'] !== 'Correct') {
              let guess: [number, number];

              if (this.extras.outputType === TimesweeperOutputType.GuessResult) {
                const result = parseInt(packet.data['input']);
                const g = parseInt(packet.data['output']);
                guess = [Math.floor(g / this.extras.boardSize), g % this.extras.boardSize];

                this.playerBoard[guess[0]][guess[1]] = result;
              }

              else if (this.extras.outputType === TimesweeperOutputType.FullBoard) {
                const line: number[] = packet.data['input'].split(' ').map(x => parseInt(x));
                guess = packet.data['output'].split(' ').map(x => parseInt(x));
                this.playerBoard = new Array(10).fill(0).map((_, i) => line.slice(i * 10, i * 10 + 10));
              }

              const ctx = this.board.nativeElement.getContext('2d');
              ctx.strokeStyle = 'orange';
              ctx.lineWidth = 2;

              for (let i = 0; i < this.extras.boardSize; i++) {
                for (let j = 0; j < this.extras.boardSize; j++) {
                  ctx.drawImage(this.images.toArray()[this.playerBoard[i][j] + 1].nativeElement, 0, 0, 16, 16, j * 32, i * 32, 32, 32);

                  if (guess[0] === i && guess[1] === j) {
                    ctx.strokeRect(j * 32, i * 32, 32, 32);
                  }
                }
              }
            }

            if (packet.data['input'] !== 'Correct') {
              this.log.push(packet.data);
              this.table.renderRows();
              this.htmlLog.nativeElement.scrollTop = this.htmlLog.nativeElement.scrollHeight;
            }
          }
        }
      }, 750);

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
