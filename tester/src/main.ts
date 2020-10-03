import * as fetchHttp from 'node-fetch';
import { VERSION } from '../../common/version';
import { Tester } from './tester';
import { TeamModel } from '../../common/src/models/team.model';

console.log(`Starting CodeLM tester build ${VERSION}`);

const REMOTE = process.argv.includes('--remote');
const SECURE = REMOTE ? 's' : '';
const BASE_URL = REMOTE ? 'dashboard.newwavecomputers.com' : 'localhost:8080';

export function makeURL(path: string) {
  return `http${SECURE}://${BASE_URL}${path}`;
}

export function makeWebsocketURI() {
  return `ws${SECURE}://${BASE_URL}`;
}

let testers: Tester[];

fetchHttp
  .default(makeURL('/api/debug/init?num_accounts=275'))
  .then(resp => resp.json())
  .catch(e => {
    console.error('Initialization failed. Is the server running?', e);
  })
  .then((resp: TeamModel[]) => {
    if (resp && resp.length > 0) {
      console.log(resp.length, 'debug accounts created.');

      testers = resp.map(team => new Tester(team));

      Promise.all(testers.map(tester => tester.login())).then(() => {
        console.log('Testers connected.');

        testers.forEach(tester => tester.start());
      });
    } else {
      console.error('Initialization failed. Got response:', resp);
    }
  });

function exitHandler() {
  fetchHttp
    .default(makeURL('/api/debug/deinit'))
    .then(resp => resp.json())
    .then(resp => {
      if (resp.success) {
        console.log('Cleaned up.');
      } else {
        console.log('Could not clean up. Is the server running?');
      }

      for (let tester of testers) {
        console.log();
        console.log(tester.team.username);
        tester.history.forEach(action => console.dir(action, { depth: null }));
        console.log();
      }

      process.exit();
    });
}

process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);
