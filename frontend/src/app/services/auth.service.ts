import { Injectable } from '@angular/core';
import {
  LoginResponse,
  LoginResponsePacket,
} from '../../../../common/src/packets/server.packet';
import { SocketService } from './socket.service';
import { TeamService } from './team.service';
import { RestService } from './rest.service';
import { AdminService } from './admin.service';
import { VERSION } from '../../../../common/version';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private socketService: SocketService,
    private restService: RestService,
    private teamService: TeamService,
    private adminService: AdminService
  ) {}

  login(username: string, password: string): Promise<LoginResponse> {
    return new Promise<LoginResponse>((resolve, reject) => {
      this.socketService
        .connect()
        .then(() => {
          this.socketService.once<LoginResponsePacket>(
            'loginResponse',
            packet => {
              if (packet.response === LoginResponse.SuccessTeam) {
                this.teamService.team.next(packet.team);
                this.restService.authId = packet.team._id;
                this.socketService.listenOnDisconnect();
                resolve(LoginResponse.SuccessTeam);
              } else if (packet.response === LoginResponse.SuccessAdmin) {
                this.adminService.admin.next(packet.admin);
                this.restService.authId = packet.admin._id;
                this.socketService.listenOnDisconnect();
                resolve(LoginResponse.SuccessAdmin);
              } else {
                reject(packet.response);
              }
            }
          );

          this.socketService.emit({
            name: 'login',
            username,
            password,
            version: VERSION,
          });
        })
        .catch(reject);
    });
  }
}
