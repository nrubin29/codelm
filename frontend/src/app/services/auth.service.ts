import { Injectable } from '@angular/core';
import { LoginPacket } from '../../../../common/src/packets/login.packet';
import { LoginResponse, LoginResponsePacket } from '../../../../common/src/packets/login.response.packet';
import { SocketService } from './socket.service';
import { TeamService } from './team.service';
import { RestService } from './rest.service';
import { AdminService } from './admin.service';
import { RegisterPacket, RegisterTeamData } from '../../../../common/src/packets/register.packet';
import { VERSION } from '../../../../common/version';
import {Packet} from "../../../../common/src/packets/packet";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private socketService: SocketService, private restService: RestService, private teamService: TeamService, private adminService: AdminService) {}

  login(username: string, password: string): Promise<LoginResponse> {
    return this.connect(new LoginPacket(username, password, VERSION));
  }

  register(teamData: RegisterTeamData): Promise<LoginResponse> {
    return this.connect(new RegisterPacket(teamData, VERSION));
  }

  private connect(packet: Packet) {
    return new Promise<LoginResponse>((resolve, reject) => {
      this.socketService.connect().then(() => {
        this.socketService.once<LoginResponsePacket>('loginResponse', packet => {
          if (packet.response === LoginResponse.SuccessTeam) {
            this.teamService.team.next(packet.team);
            this.restService.authId = packet.team._id;
            this.socketService.listenOnDisconnect();
            resolve(LoginResponse.SuccessTeam);
          }

          else if (packet.response === LoginResponse.SuccessAdmin) {
            this.adminService.admin.next(packet.admin);
            this.restService.authId = packet.admin._id;
            this.socketService.listenOnDisconnect();
            resolve(LoginResponse.SuccessAdmin);
          }

          else {
            reject(packet.response);
          }
        });

        this.socketService.emit(packet);
      }).catch(reject);
    });
  }
}
