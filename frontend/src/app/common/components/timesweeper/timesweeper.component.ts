import {
  AfterViewInit,
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { GameExtrasPacket } from '@codelm/common/src/packets/server.packet';
import { SocketService } from '../../../services/socket.service';
import {
  TimesweeperExtras,
  TimesweeperOutputType,
} from '@codelm/common/src/models/game.model';
import { GameComponent } from '../../views/game/game.component';

@Component({
  selector: 'app-timesweeper',
  templateUrl: './timesweeper.component.html',
  styleUrls: ['./timesweeper.component.scss'],
})
export class TimesweeperComponent implements AfterViewInit {
  @ViewChild('board', { static: true }) board: ElementRef<HTMLCanvasElement>;
  @ViewChildren('img') images: QueryList<ElementRef<HTMLImageElement>>;

  extras: TimesweeperExtras;
  playerBoard: number[][];

  constructor(
    private gameComponent: GameComponent,
    private socketService: SocketService
  ) {}

  ngAfterViewInit() {
    this.socketService.once<GameExtrasPacket>('submissionExtras', packet => {
      this.extras = packet.extras;

      this.playerBoard = [];

      for (let i = 0; i < this.extras.boardSize; i++) {
        this.playerBoard.push(new Array(this.extras.boardSize).fill(-1));
      }
    });

    this.gameComponent.onPacketEvaluate = packet => {
      if (packet.name === 'gameTurn') {
        let guess: [number, number];

        if (this.extras.outputType === TimesweeperOutputType.GuessResult) {
          const result = parseInt(packet.input);
          const g = parseInt(packet.output);
          guess = [
            Math.floor(g / this.extras.boardSize),
            g % this.extras.boardSize,
          ];

          this.playerBoard[guess[0]][guess[1]] = result;
        } else if (this.extras.outputType === TimesweeperOutputType.FullBoard) {
          const line: number[] = packet.input.split(' ').map(x => parseInt(x));
          guess = packet.output.split(' ').map(x => parseInt(x)) as [
            number,
            number
          ];
          this.playerBoard = new Array(10)
            .fill(0)
            .map((_, i) => line.slice(i * 10, i * 10 + 10));
        }

        const ctx = this.board.nativeElement.getContext('2d');
        ctx.strokeStyle = 'orange';
        ctx.lineWidth = 2;

        for (let i = 0; i < this.extras.boardSize; i++) {
          for (let j = 0; j < this.extras.boardSize; j++) {
            ctx.drawImage(
              this.images.toArray()[this.playerBoard[i][j] + 1].nativeElement,
              0,
              0,
              16,
              16,
              j * 32,
              i * 32,
              32,
              32
            );

            if (guess[0] === i && guess[1] === j) {
              ctx.strokeRect(j * 32, i * 32, 32, 32);
            }
          }
        }
      }
    };
  }
}
