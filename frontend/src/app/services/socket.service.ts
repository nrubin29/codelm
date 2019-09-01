import {Injectable} from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Packet } from '../../../../common/src/packets/packet';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: WebSocket;
  private events: Map<string, ((Packet) => void)[]>;
  private eventsOnce: Map<string, ((Packet) => void)[]>;

  constructor(private router: Router) {
    this.events = new Map<string, ((Packet) => void)[]>();
    this.eventsOnce = new Map<string, ((Packet) => void)[]>();
  }

  connect(): Promise<void> {
    this.socket = new WebSocket(environment.wsProtocol + '://' + location.hostname + environment.socketSuffix);

    this.socket.onmessage = (data) => {
      const packet: Packet = JSON.parse(data.data);
      (this.events[packet.name] || []).map(fn => fn(packet));
      (this.eventsOnce[packet.name] || []).map(fn => fn(packet));
      this.eventsOnce[packet.name] = [];
    };

    return new Promise<void>((resolve, reject) => {
      this.socket.onopen = () => resolve();
    });
  }

  on<T extends Packet>(event: string, fn: (packet: T) => void) {
    this.events[event] = this.events.has(event) ? this.events[event].concat([fn]) : [fn];
  }

  once<T extends Packet>(event: string, fn: (packet: T) => void) {
    this.eventsOnce[event] = this.eventsOnce.has(event) ? this.eventsOnce[event].concat([fn]) : [fn];
  }

  off(event: string) {
    this.events[event] = [];
    this.eventsOnce[event] = [];
  }

  offAll() {
    this.events = new Map<string, ((Packet) => void)[]>();
    this.eventsOnce = new Map<string, ((Packet) => void)[]>();
  }

  listenOnDisconnect() {
    this.socket.onclose = () => {
      this.offAll();
      this.router.navigate(['/disconnected']);
    };
  }

  isConnected(): boolean {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  emit(packet: Packet) {
    if (!this.isConnected()) {
      throw new Error('Socket is not connected!');
    }

    this.socket.send(JSON.stringify(packet));
  }
}
