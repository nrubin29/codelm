import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { TeamService } from './team.service';
import { RestService } from './rest.service';
import { AdminService } from './admin.service';
import { VERSION } from '@codelm/common/version';
import {
  isTeamJwt,
  Jwt,
  LoginRequest,
  LoginResponse,
  LoginResponseType,
} from '@codelm/common/src/models/auth.model';
import { ConnectResponsePacket } from '@codelm/common/src/packets/server.packet';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private endpoint = 'auth';
  private jwt: Jwt;

  constructor(
    private socketService: SocketService,
    private restService: RestService,
    private teamService: TeamService,
    private adminService: AdminService
  ) {}

  async login(username: string, password: string): Promise<LoginResponseType> {
    const loginResponse = await this.restService.post<LoginResponse>(
      this.endpoint,
      {
        username,
        password,
        version: VERSION,
      } as LoginRequest
    );

    if (
      loginResponse.response === LoginResponseType.SuccessTeam ||
      loginResponse.response === LoginResponseType.SuccessAdmin
    ) {
      this.restService.jwtString = loginResponse.jwt;
      console.log(this.restService.jwtString);
      this.jwt = JSON.parse(atob(this.restService.jwtString.split('.')[1]));
      console.log(this.jwt);

      await this.connect();
      return loginResponse.response;
    } else {
      throw loginResponse.response;
    }
  }

  private connect() {
    return new Promise<LoginResponse>((resolve, reject) => {
      this.socketService
        .connect()
        .then(() => {
          this.socketService.once<ConnectResponsePacket>(
            'connectResponse',
            packet => {
              if (!packet.success) {
                reject();
                return;
              }

              if (isTeamJwt(this.jwt)) {
                return this.teamService.refreshTeam();
              } else {
                return this.adminService.refreshAdmin();
              }
            }
          );

          this.socketService.emit({
            name: 'connect',
            jwt: this.restService.jwtString,
            version: VERSION,
          });
        })
        .then(() => {
          this.socketService.listenOnDisconnect();
          resolve();
        })
        .catch(reject);
    });
  }
}
