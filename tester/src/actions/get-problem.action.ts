import {Action} from "../action";
import {Tester} from "../tester";
import * as fetchHttp from 'node-fetch';
import {makeURL} from '../main';

export class GetProblemAction extends Action {
    constructor() {
        super('getProblem');
    }

    run(tester: Tester) {
        return fetchHttp.default(
            makeURL('/api/problems/division/5e82e89f2077fd37a5b4b90f'),
            {headers: {Authorization: 'Basic ' + tester.team._id}}
        ).then(result => result.json());
    }
}
