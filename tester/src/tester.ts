import * as WebSocket from 'ws';
import { SocketPacketManager } from '@codelm/common/src/packet.manager';
import { TeamModel } from '@codelm/common/src/models/team.model';
import { makeWebsocketURI } from './main';
import { Action, ActionInvocation, TimeDelta } from './action';
import { WaitAction } from './actions/wait.action';
import { SubmitAction } from './actions/submit.action';
import { LoginAction } from './actions/login.action';
import { GetProblemAction } from './actions/get-problem.action';

export class Tester extends SocketPacketManager<WebSocket> {
  history: ActionInvocation[] = [];
  actions = [WaitAction, GetProblemAction, SubmitAction];

  constructor(public team: TeamModel) {
    super(() => new WebSocket(makeWebsocketURI()));
  }

  login() {
    return this.runAction(new LoginAction());
  }

  async start() {
    let actionIndex = 0;

    while (true) {
      await this.runAction(new this.actions[actionIndex]());
      actionIndex = (actionIndex + 1) % this.actions.length;
    }
  }

  log(...args: any[]) {
    console.log(`[${this.team.username}]`, ...args);
  }

  private runAction(action: Action) {
    this.log(`Starting action ${action.name}`);

    const invocation: ActionInvocation = {
      action: action.name,
      timing: {
        timeStart: new Date(),
        timeStop: undefined,
        timeDelta: undefined,
      },
      result: undefined,
    };

    this.history.push(invocation);
    return action.run(this).then(result => {
      invocation.timing.timeStop = new Date();
      invocation.timing.timeDelta = new TimeDelta(
        invocation.timing.timeStart,
        invocation.timing.timeStop
      );
      invocation.result = result;

      this.log(`Finished action ${action.name}`);
      return result;
    });
  }
}
