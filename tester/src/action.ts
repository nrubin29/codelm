import {Tester} from "./tester";

export abstract class Action {
    protected constructor(public name: string) {}
    abstract run(tester: Tester): Promise<any>;
}

export class TimeDelta {
    seconds: number;
    milliseconds: number;

    constructor(from: Date, to: Date) {
        const delta = new Date(to.getTime() - from.getTime());
        this.seconds = delta.getSeconds();
        this.milliseconds = delta.getMilliseconds();
    }

    toString(): string {
        return `${this.seconds}:${this.milliseconds}`;
    }
}

interface ActionTiming {
    timeStart: Date;
    timeStop: Date;
    timeDelta: TimeDelta;
}

export interface ActionInvocation {
    action: string;
    timing: ActionTiming;
    result: any;
}
