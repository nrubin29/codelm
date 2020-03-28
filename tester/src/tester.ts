import * as WebSocket from 'ws';
import {SocketPacketManager} from "../../common/src/packet.manager";
import {TeamModel} from "../../common/src/models/team.model";

export class Tester extends SocketPacketManager<WebSocket> {
    constructor(public team: TeamModel) {
        super(() => new WebSocket('ws://localhost:8080'));
    }
}
