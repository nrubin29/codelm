import { Packet } from './packets/packet';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Represents a class that is able to send and receive packets from some data source.
 */
abstract class PacketManager {
  private readonly events: Map<Packet['name'], ((packet: Packet) => void)[]>;
  private readonly eventsOnce: Map<
    Packet['name'],
    ((packet: Packet) => void)[]
  >;

  constructor() {
    this.events = new Map<Packet['name'], ((packet: Packet) => void)[]>();
    this.eventsOnce = new Map<Packet['name'], ((packet: Packet) => void)[]>();
  }

  on<T extends Packet>(event: T['name'], fn: (packet: T) => void) {
    this.events.set(event, (this.events.get(event) ?? []).concat([fn]));
    // this.events[event as Packet['name']] = this.events.has(event) ? this.events[event as Packet['name']].concat([fn]) : [fn];
  }

  once<T extends Packet>(event: T['name'], fn: (packet: T) => void) {
    this.eventsOnce.set(event, (this.eventsOnce.get(event) ?? []).concat([fn]));
    // this.eventsOnce[event as Packet['name']] = this.eventsOnce.has(event) ? this.eventsOnce[event as Packet['name']].concat([fn]) : [fn];
  }

  off(event: Packet['name']) {
    this.events.set(event, []);
    this.eventsOnce.set(event, []);
  }

  offAll() {
    this.events.clear();
    this.eventsOnce.clear();
  }

  emit(packet: Packet) {
    if (!this.isConnected()) {
      throw new Error('Socket is not connected!');
    }

    this.send(JSON.stringify(packet));
  }

  connect(): Promise<void> {
    return this.open();
  }

  // The below methods are source-specific and are implemented by subclasses. They are called by the source-agnostic
  // methods above.

  /**
   * TODO: This needs to return any because otherwise common and frontend have two separate versions of rxjs and they
   *  don't like each other. This should be fixed by having the other packages add common as a dependency.
   */
  abstract onDisconnect(): any;
  abstract isConnected(): boolean;
  protected abstract open(): Promise<void>;
  protected abstract send(packetString: string);

  /**
   * Called by subclasses when they receive data from their source.
   */
  protected onData(data: string) {
    let packet: Packet;

    try {
      packet = JSON.parse(data);
    } catch {
      packet = { name: 'unexpectedData', data };
    }

    (this.events.get(packet.name) ?? []).forEach(fn => fn(packet));
    (this.eventsOnce.get(packet.name) ?? []).forEach(fn => fn(packet));
    this.eventsOnce.set(packet.name, []);
  }
}

interface WebSocketLike {
  OPEN: number;
  onclose: ((ev: any) => any) | null;
  onmessage: ((ev: any) => any) | null;
  onopen: ((ev: any) => any) | null;
  readyState: number;
  send(message: string);
}

export abstract class SocketPacketManager<
  T extends WebSocketLike
> extends PacketManager {
  private socket: T;

  constructor(private websocketFactory: () => T) {
    super();
  }

  onDisconnect(): any {
    /*
        For some reason, `fromEvent` didn't work here:
        return fromEvent(this.socket, 'onclose').pipe(tap(() => { this.offAll() }));
         */
    return new Observable<void>(subscriber => {
      this.socket.onclose = () => {
        subscriber.next();
      };
    }).pipe(tap(() => this.offAll()));
  }

  isConnected(): boolean {
    return this.socket && this.socket.readyState === this.socket.OPEN;
    // Should be WebSocket.OPEN, but the type of WebSocket depends on T.
  }

  protected send(packetString: string) {
    this.socket.send(packetString);
  }

  protected open(): Promise<void> {
    return new Promise<void>(resolve => {
      this.socket = this.websocketFactory();

      this.socket.onmessage = data => {
        this.onData(data.data as string);
      };

      this.socket.onopen = () => {
        resolve();
      };
    });
  }
}

/*
 Readable and Writable are defined by Node, but we don't want to import them because frontend doesn't have @types/node.
 So here are some interfaces that expose what we need and are compatible with Node.
 */

interface ReadableLike {
  readable: boolean;
  on(event: 'data', callback: (data: Buffer) => void);
  once(event: 'close', callback: () => void);
}

interface WritableLike {
  write(message: string);
  end();
}

export abstract class StdioPacketManager extends PacketManager {
  constructor(private read: ReadableLike, private write: WritableLike) {
    super();

    read.on('data', data => {
      this.onData(data.toString().trim());
    });
  }

  onDisconnect(): any {
    return new Observable<void>(subscriber => {
      this.read.once('close', () => {
        subscriber.next();
      });
    }).pipe(tap(() => this.offAll()));
  }

  isConnected(): boolean {
    return this.read.readable;
  }

  protected send(packetString: string) {
    this.write.write(packetString + '\n');
    // this.write.end(); // TODO: Will probably need to flush (drain?) instead of end()ing.
  }

  protected open(): Promise<void> {
    return Promise.resolve();
  }
}
