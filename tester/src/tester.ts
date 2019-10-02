import * as WebSocket from 'ws';
import {LoginPacket} from "../../common/src/packets/login.packet";
import {VERSION} from "../../common/version";
import {LoginResponse, LoginResponsePacket} from "../../common/src/packets/login.response.packet";
import {SocketManager} from "../../common/src/socket-manager";

export class Tester extends SocketManager {
    constructor(private username: string) {
        super('ws://localhost:8080');
    }

    connect(): Promise<void> {
        return super.connect().then(() => new Promise<void>((resolve, reject) => {
            this.once<LoginResponsePacket>('loginResponse', packet => {
                if (packet.response === LoginResponse.SuccessTeam) {
                    resolve();
                }

                else {
                    reject(packet.response);
                }
            });

            this.emit(new LoginPacket(this.username, 'password', VERSION));
        }));
    }
}
