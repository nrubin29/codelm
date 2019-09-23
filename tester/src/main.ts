import * as fetchHttp from 'node-fetch';
import {VERSION} from "../../common/version";
import {debugTeamUsernames} from "../../common/src/debug";
import {Tester} from "./tester";

console.log(`Starting CodeLM tester build ${VERSION}`);

fetchHttp.default('http://localhost:8080/api/debug/init').then(resp => resp.json()).then(resp => {
    if (resp.success) {
        console.log('Debug accounts created.');

        const testers = debugTeamUsernames.map(username => new Tester(username));

        Promise.all(testers.map(tester => tester.connect())).then(() => {
            console.log('Testers connected.');
        });
    }

    else {
        console.log('Initialization failed. Is the server running?');
    }
});

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
