export interface GameResult {
    score?: number;
    error?: string;
}

export interface Game {
    onInput(data: string): string | GameResult;
    isFinished(): boolean;
    getResult(): GameResult;
}
