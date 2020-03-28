import {Injectable} from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import {SocketPacketManager} from "../../../../common/src/packet.manager";
import {skipWhile} from "rxjs/operators";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SocketService extends SocketPacketManager<WebSocket> {
  listening = false;

  constructor(private router: Router) {
    super(() => new WebSocket(environment.wsProtocol + '://' + location.hostname + environment.socketSuffix));
  }

  /**
   * This is necessary because we don't want to handle disconnects until the user logs in successfully.
   */
  listenOnDisconnect() {
    this.listening = true;
  }

  connect(): Promise<void> {
    return super.connect().then(() => {
      // TODO: Remove the type conversion once I fix the problem with onDisconnect().
      (this.onDisconnect() as Observable<void>).pipe(skipWhile(() => !this.listening)).subscribe(() => { this.router.navigate(['/disconnected']) });
    });
  }
}
