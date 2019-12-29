import {Action} from "../action";
import {Tester} from "../tester";
import {LoginResponse, LoginResponsePacket} from "../../../common/src/packets/login.response.packet";
import {LoginPacket} from "../../../common/src/packets/login.packet";
import {VERSION} from "../../../common/version";

export class LoginAction extends Action {
    runAction(tester: Tester) {
        return tester.connect().then(() => new Promise<void>((resolve, reject) => {
            tester.once<LoginResponsePacket>('loginResponse', packet => {
                if (packet.response === LoginResponse.SuccessTeam) {
                    resolve();
                }

                else {
                    reject(packet.response);
                }
            });

            tester.emit(new LoginPacket(tester.team.username, 'password', VERSION));
        }));
    }
}
