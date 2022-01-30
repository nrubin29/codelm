import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { SocketService } from '../services/socket.service';

@Injectable({
  providedIn: 'root',
})
export class SocketGuard implements CanActivate {
  constructor(private socketService: SocketService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.socketService.isConnected();
  }
}
