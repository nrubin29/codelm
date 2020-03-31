import {Action} from "../action";
import {Tester} from "../tester";

export class WaitAction extends Action {
    constructor() {
        super('wait');
    }

    run(tester: Tester) {
        return new Promise<undefined>(resolve => {
            const time = Math.floor(Math.random() * 100000);
            tester.log(`Going to wait for ${time / 1000}s`);
            setTimeout(() => { resolve(); }, time);
        });
    }
}
