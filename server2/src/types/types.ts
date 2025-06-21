import { Producer, WebRtcTransport } from "mediasoup/node/lib/types";

export interface PeerInfo {
  transports: WebRtcTransport[];
  producers: Producer[];
}

export interface Room {
  id: string;
  peers: Map<string, PeerInfo>;
}
