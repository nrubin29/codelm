import {ClientPacket} from "./client.packet";
import {ServerPacket} from "./server.packet";
import {CodeRunnerPacket} from "./coderunner.packet";

export type Packet = ClientPacket | ServerPacket | CodeRunnerPacket;
