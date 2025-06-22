import { Producer, WebRtcTransport, Consumer } from "mediasoup/node/lib/types";

export interface PeerInfo {
  transports: WebRtcTransport[];
  producers: Producer[];
  consumers:Consumer[]
}

export interface Room {
  id: string;
  peers: Map<string, PeerInfo>;
}
