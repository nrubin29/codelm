import {ClientPacket} from "./client.packet";
import {ServerPacket} from "./server.packet";

export type Packet = ClientPacket | ServerPacket;
