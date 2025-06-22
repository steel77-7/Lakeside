import { Room, PeerInfo } from "../types/types";
import { WebRtcTransport, Producer, Consumer } from "mediasoup/node/lib/types";

export class RoomManager {
  private rooms: Map<string, Room> = new Map();

  createRoom(roomId: string) {
    if (this.rooms.has(roomId)) throw new Error("Room already exists");
    this.rooms.set(roomId, { id: roomId, peers: new Map() });
  }

  joinRoom(roomId: string, clientId: string): Room {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error("Room not found");
    if (!room.peers.has(clientId)) {
      room.peers.set(clientId, { transports: [], producers: [],consumers:[] });
    }
    return room;
  }

  getPeer(roomId: string, clientId: string): PeerInfo | undefined {
    return this.rooms.get(roomId)?.peers.get(clientId);
  }

  addTransporter(roomId: string, clientId: string, transport: WebRtcTransport) {
    const peer = this.getPeer(roomId, clientId);
    peer?.transports.push(transport);
  }

  addProducer(roomId: string, clientId: string, producer: Producer) {
    const peer = this.getPeer(roomId, clientId);
    peer?.producers.push(producer);
  }
  addConsumer(roomId: string, clientId: string, consumer: Consumer) {
    const peer = this.getPeer(roomId, clientId);
    peer?.consumers.push (consumer) ;
  }
  removePeer(roomId: string, clientId: string) {
    const room = this.rooms.get(roomId);
    const peer = room?.peers.get(clientId);
    if (peer) {
      peer.transports.forEach((t) => t.close());
      peer.producers.forEach((t) => t.close());
      room?.peers.delete(clientId);
    }
    if (room?.peers.size === 0) {
      this.rooms.delete(roomId);
    }
  }
}
