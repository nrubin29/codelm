import * as fetchHttp from 'node-fetch';
import {VERSION} from "../../common/version";
import {Tester} from "./tester";
import {TeamModel} from "../../common/src/models/team.model";
import {LoginAction} from "./actions/login.action";
import {SubmitAction} from "./actions/submit.action";

console.log(`Starting CodeLM tester build ${VERSION}`);

const actions = [new LoginAction(), new SubmitAction()];

fetchHttp.default('http://localhost:8080/api/debug/init')
    .then(resp => resp.json())
    .catch(e => {
        console.error('Initialization failed. Is the server running?', e);
    })
    .then((resp: TeamModel[]) => {
        if (resp && resp.length > 0) {
            console.log(resp.length, 'debug accounts created.');

            const testers = resp.map(team => new Tester(team));

            Promise.all(testers.map(tester => actions[0].run(tester))).then(() => {
                console.log('Testers connected.');

                // noinspection JSIgnoredPromiseFromCall
                runActions(testers);
            });
        }

        else {
            console.error('Initialization failed. Got response:', resp);
        }
    });

async function runActions(testers: Tester[]) {
    for (let action of actions.slice(1)) {
        await Promise.all(testers.map(tester => action.run(tester)));
    }

    for (let action of actions) {
        console.log();
        console.log(action.results);
        console.log();
    }
}

function exitHandler() {
    fetchHttp.default('http://localhost:8080/api/debug/deinit').then(resp => resp.json()).then(resp => {
        if (resp.success) {
            console.log('Cleaned up.');
        }

        else {
            console.log('Could not clean up. Is the server running?');
        }

        process.exit();
    });
}

process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);
