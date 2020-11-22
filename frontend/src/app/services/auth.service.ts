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
import { AuthInterceptor } from './auth.interceptor';

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
      AuthInterceptor.jwtString = loginResponse.jwt;
      this.jwt = JSON.parse(atob(AuthInterceptor.jwtString.split('.')[1]));

      await this.connect();
      return loginResponse.response;
    } else {
      throw loginResponse.response;
    }
  }

  private async connect() {
    await this.socketService.connect();

    await new Promise<void>((resolve, reject) => {
      this.socketService.once<ConnectResponsePacket>(
        'connectResponse',
        packet => {
          if (!packet.success) {
            reject();
            return;
          }

          resolve();
        }
      );

      this.socketService.emit({
        name: 'connect',
        jwt: AuthInterceptor.jwtString,
        version: VERSION,
      });
    });

    if (isTeamJwt(this.jwt)) {
      await this.teamService.refreshTeam();
    } else {
      await this.adminService.refreshAdmin();
    }

    this.socketService.listenOnDisconnect();
  }
}
