import * as WebSocket from 'ws';
import {Packet} from "../../common/src/packets/packet";
import {LoginPacket} from "../../common/src/packets/login.packet";
import {VERSION} from "../../common/version";
import {LoginResponse, LoginResponsePacket} from "../../common/src/packets/login.response.packet";

// TODO: Encapsulate all of the socket-related code (on, once, emit, etc.) into a common SocketWrapper class and share
//  it with the frontend's SocketManager.
export class Tester {
    private socket: WebSocket;
    private readonly events: Map<string, ((Packet) => void)[]>;
    private readonly eventsOnce: Map<string, ((Packet) => void)[]>;

    constructor(private username: string) {
        this.events = new Map<string, ((Packet) => void)[]>();
        this.eventsOnce = new Map<string, ((Packet) => void)[]>();
    }

    on<T extends Packet>(event: string, fn: (packet: T) => void) {
        this.events[event] = this.events.has(event) ? this.events[event].concat([fn]) : [fn];
    }

    once<T extends Packet>(event: string, fn: (packet: T) => void) {
        this.eventsOnce[event] = this.eventsOnce.has(event) ? this.eventsOnce[event].concat([fn]) : [fn];
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

    connect(): Promise<void> {
        this.socket = new WebSocket('ws://localhost:8080');

        this.socket.onmessage = (data) => {
            const packet: Packet = JSON.parse(<string>data.data);
            (this.events[packet.name] || []).map(fn => fn(packet));
            (this.eventsOnce[packet.name] || []).map(fn => fn(packet));
            this.eventsOnce[packet.name] = [];
        };

        return new Promise<void>((resolve, reject) => {
            this.socket.onopen = () => {
                this.once<LoginResponsePacket>('loginResponse', packet => {
                    if (packet.response === LoginResponse.SuccessTeam) {
                        resolve();
                    }

                    else {
                        reject(packet.response);
                    }
                });

                this.emit(new LoginPacket(this.username, 'password', VERSION));
            };
        });
    }
}
