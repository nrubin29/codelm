import {Packet} from "./packets/packet";
import {Observable} from "rxjs";
import {tap} from "rxjs/operators";

interface WebSocketLike {
    OPEN: number;
    onclose: ((ev: any) => any) | null;
    onmessage: ((ev: any) => any) | null;
    onopen: ((ev: any) => any) | null;
    readyState: number;
    send(string);
}

export abstract class SocketManager<T extends WebSocketLike> {
    private socket: T;

    private readonly events: Map<string, ((Packet) => void)[]>;
    private readonly eventsOnce: Map<string, ((Packet) => void)[]>;

    constructor(private websocketFactory: () => T) {
        this.events = new Map<string, ((Packet) => void)[]>();
        this.eventsOnce = new Map<string, ((Packet) => void)[]>();
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
        this.events.clear();
        this.eventsOnce.clear();
    }

    /**
     * TODO: This needs to return any because otherwise common and frontend have two separate versions of rxjs and they
     *  don't like each other. This should be fixed by having the other packages add common as a dependency.
     */
    onDisconnect(): any {
        /*
        For some reason, `fromEvent` didn't work here:
        return fromEvent(this.socket, 'onclose').pipe(tap(() => { this.offAll() }));
         */
        return new Observable<void>(subscriber => {
            this.socket.onclose = () => { subscriber.next(); };
        }).pipe(tap(() => this.offAll()));
    }

    isConnected(): boolean {
        return this.socket && this.socket.readyState === this.socket.OPEN;
        // Should be WebSocket.OPEN, but the type of WebSocket depends on T.
    }

    emit(packet: Packet) {
        if (!this.isConnected()) {
            throw new Error('Socket is not connected!');
        }

        this.socket.send(JSON.stringify(packet));
    }

    connect(): Promise<void> {
        this.socket = this.websocketFactory();

        this.socket.onmessage = (data) => {
            const packet: Packet = JSON.parse(<string>data.data);
            (this.events[packet.name] || []).map(fn => fn(packet));
            (this.eventsOnce[packet.name] || []).map(fn => fn(packet));
            this.eventsOnce[packet.name] = [];
        };

        return new Promise<void>(resolve => {
            this.socket.onopen = () => {
                resolve();
            };
        });
    }
}
