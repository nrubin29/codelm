import Game from "./game";
import {GameResult} from "./game.result";

export class HighLow implements Game {
  answer: number;
  guesses: number;
  finished: boolean;

  constructor() {
    this.answer = Math.floor(Math.random() * 100) + 1;
    this.guesses = 0;
    this.finished = false;
  }

  onInput(data: string): string | GameResult {
    this.guesses++;
    const guess = parseInt(data);

    if (isNaN(guess)) {
      return {error: 'invalid guess'};
    }

    else if (guess > this.answer) {
      return '1';
    }

    else if (guess < this.answer) {
      return '-1';
    }

    else {
      this.finished = true;
      return '0';
      // return {score: this.guesses};
    }
  }

  isFinished(): boolean {
    return this.finished;
  }

  getResult(): GameResult {
    return {score: this.guesses};
  }
}
