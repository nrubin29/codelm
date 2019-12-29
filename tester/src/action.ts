import {Tester} from "./tester";

export abstract class Action {
    results = new Map<string, ActionData>();

    run(tester: Tester) {
        const data = {timeStart: new Date(), timeStop: undefined, timeDelta: undefined};
        this.results.set(tester.team.username, data);
        return this.runAction(tester).then(res => {
            data.timeStop = new Date();
            data.timeDelta = new TimeDelta(data.timeStart, data.timeStop);
            return res;
        });
    }

    abstract runAction(tester: Tester): Promise<any>;
}

interface ActionData {
    timeStart: Date;
    timeStop: Date;
    timeDelta: TimeDelta;
}

class TimeDelta {
    seconds: number;
    milliseconds: number;

    constructor(from: Date, to: Date) {
        const delta = new Date(to.getTime() - from.getTime());
        this.seconds = delta.getSeconds();
        this.milliseconds = delta.getMilliseconds();
    }
}
