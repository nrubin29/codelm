import Game from "./game";
import {GameResult} from "./game.result";
import {TimesweeperExtras, TimesweeperOutputType} from "../../../common/src/models/game.model";

const PERSON = 9;

export class Timesweeper implements Game {
  fullBoard: number[][];
  playerBoard: number[][];
  guesses: number;

  constructor(private extras: TimesweeperExtras) {
    this.fullBoard = [];
    this.playerBoard = [];
    this.guesses = 0;

    // Generate empty boards
    for (let i = 0; i < extras.boardSize; i++) {
      this.fullBoard.push(new Array(extras.boardSize).fill(0));
      this.playerBoard.push(new Array(extras.boardSize).fill(-1));
    }

    // Place people
    for (let i = 0; i < extras.numPeople; i++) {
      let row, col;

      do {
        row = Math.floor(Math.random() * extras.boardSize);
        col = Math.floor(Math.random() * extras.boardSize);
      } while (this.fullBoard[row][col] !== 0);

      this.fullBoard[row][col] = PERSON;
    }

    const isPerson = x => x === PERSON ? 1 : 0;

    const countNeighbors = (row, col) => {
      let sum = 0;

      if (this.fullBoard[row - 1]) {
        sum += isPerson(this.fullBoard[row - 1][col - 1]) +
          isPerson(this.fullBoard[row - 1][col]) +
          isPerson(this.fullBoard[row - 1][col + 1]);
      }

      if (this.fullBoard[row]) {
        sum += isPerson(this.fullBoard[row][col + 1]) +
          isPerson(this.fullBoard[row][col - 1])
      }

      if (this.fullBoard[row + 1]) {
        sum += isPerson(this.fullBoard[row + 1][col + 1]) +
          isPerson(this.fullBoard[row + 1][col]) +
          isPerson(this.fullBoard[row + 1][col - 1])
      }

      return sum
    };

    // Fill in numbers
    for (let row = 0; row < extras.boardSize; row++) {
      for (let col = 0; col < extras.boardSize; col++) {
        if (this.fullBoard[row][col] !== PERSON) {
          this.fullBoard[row][col] = countNeighbors(row, col);
        }
      }
    }
  }

  private contains(needle, haystack) {
    for (let element of haystack) {
      if (JSON.stringify(needle) === JSON.stringify(element)) {
        return true;
      }
    }

    return false;
  }

  private uncover(row, col, base=true, visited=[]) {
    visited.push([row, col]);

    if (this.playerBoard[row] !== undefined && this.playerBoard[row][col] !== undefined) {
      if (base || this.fullBoard[row][col] !== PERSON) {
        this.playerBoard[row][col] = this.fullBoard[row][col];
      }

      if (this.playerBoard[row][col] === 0) {
        for (let i = -1; i < 2; i++) {
          for (let j = -1; j < 2; j++) {
            if (!this.contains([row + i, col + j], visited)) {
              this.uncover(row + i, col + j, false, visited);
            }
          }
        }
      }
    }
  }

  public isFinished(): boolean {
    let numPeople = 0;

    for (let row = 0; row < this.extras.boardSize; row++) {
      for (let col = 0; col < this.extras.boardSize; col++) {
        if (this.playerBoard[row][col] === PERSON) {
          numPeople++;
        }
      }
    }

    return numPeople === this.extras.numPeople;
  }

  onInput(data: string): string | GameResult {
    this.guesses++;

    const split = data.split(' ').filter(x => x.length > 0).map(x => parseInt(x));

    if (split.findIndex(isNaN) !== -1) {
      return {error: 'invalid guess'};
    }

    let res;

    if (this.extras.outputType === TimesweeperOutputType.FullBoard) {
      if (split.length !== 2) {
        return {error: 'invalid guess'};
      }

      else if (split.findIndex(x => x < 0 || x > 9) !== -1) {
          return {error: 'invalid guess'};
      }

      const row = split[0], col = split[1];
      this.uncover(row, col);
      res = this.playerBoard.map(r => r.join(' ')).join(' ');
    }

    else if (this.extras.outputType === TimesweeperOutputType.GuessResult) {
      if (split.length !== 1) {
        return {error: 'invalid guess'};
      }

      else if (split[0] < 0 || split[0] > 24) {
          return {error: 'invalid guess'};
      }

      const row = Math.floor(split[0] / this.extras.boardSize), col = split[0] % this.extras.boardSize;
      this.uncover(row, col);
      res = this.playerBoard[row][col].toString();
    }

    return res;

    // if (this.finished()) {
    //   return {score: this.guesses};
    // }
    //
    // else {
    //   return res;
    // }
  }

  getResult(): GameResult {
    return {score: this.guesses};
  }
}
