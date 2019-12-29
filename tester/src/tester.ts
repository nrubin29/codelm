import * as WebSocket from 'ws';
import {SocketManager} from "../../common/src/socket-manager";
import {TeamModel} from "../../common/src/models/team.model";

export class Tester extends SocketManager<WebSocket> {
    constructor(public team: TeamModel) {
        super(() => new WebSocket('ws://localhost:8080'));
    }
}
