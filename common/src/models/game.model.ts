export enum Game {
    HighLow = 'High Low',
    Timesweeper = 'Timesweeper'
}

export enum TimesweeperOutputType {
    FullBoard = 'FullBoard',
    GuessResult = 'GuessResult'
}

export interface TimesweeperExtras {
    boardSize: number;
    numPeople: number;
    outputType: TimesweeperOutputType;
}