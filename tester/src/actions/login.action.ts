import {Action} from "../action";
import {Tester} from "../tester";
import {LoginResponse, LoginResponsePacket} from "../../../common/src/packets/server.packet";
import {VERSION} from "../../../common/version";

export class LoginAction extends Action {
    constructor() {
        super('login');
    }

    run(tester: Tester) {
        return tester.connect().then(() => new Promise<LoginResponsePacket>((resolve, reject) => {
            tester.once<LoginResponsePacket>('loginResponse', packet => {
                if (packet.response === LoginResponse.SuccessTeam) {
                    resolve(packet);
                }

                else {
                    reject(packet.response);
                }
            });

            tester.emit({name: 'login', username: tester.team.username, password: 'password', version: VERSION});
        }));
    }
}
