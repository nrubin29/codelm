import {GameResult} from "./game.result";

export default interface Game {
    onInput(data: string): string | GameResult;
    isFinished(): boolean;
    getResult(): GameResult;
}
