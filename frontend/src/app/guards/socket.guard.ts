import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { SocketService } from '../services/socket.service';

@Injectable({
  providedIn: 'root'
})
export class SocketGuard implements CanActivate {
  constructor(private socketService: SocketService, private router: Router) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.socketService.isConnected()) {
      return true;
    }

    this.router.navigate(['/disconnected']);
    return false;
  }
}
