export enum GameType {
  HighLow = 'High Low',
  Timesweeper = 'Timesweeper',
}

export enum TimesweeperOutputType {
  FullBoard = 'FullBoard',
  GuessResult = 'GuessResult',
}

export interface TimesweeperExtras {
  game: GameType.Timesweeper;
  boardSize: number;
  numPeople: number;
  outputType: TimesweeperOutputType;
}

export type GameExtras = TimesweeperExtras;
