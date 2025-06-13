import { v4 as uuidv4 } from "uuid";

export class PeerService {
  private ws: WebSocket;
  private peerList: Map<string, RTCPeerConnection>;
  constructor(soc: WebSocket, ) {
    this.peerList = new Map<string, RTCPeerConnection>();
    this.ws = soc;
  
  }

  async addPeer() {
    // if (this.peerList.has(peerID)) return;
    const peerID = uuidv4();

    const pc = new RTCPeerConnection();
    pc.onicecandidate = (event: any) => {
      if (event.candidate && this.ws) {
        this.ws.send(
          JSON.stringify({
            type: "ice-candidate",
            payload: {
              candidate: event.candidate,
              peerID
            },
          })
        );
      }
    };
    let offer = await pc.createOffer();
    await pc.setLocalDescription(new RTCSessionDescription(offer));
    this.ws.send(
      JSON.stringify({
        type: "offer",
        payload: {
          peerID,
          SPD: offer,
        },
      })
    );
    this.peerList.set(peerID, pc);
  }

  async handleSignal(message: any) {
    let message_type = message.type;
    let pc = this.peerList.get(message.payload.sender);
    if (!pc) {
      console.log("peer connection not found ");
      return;
    }
    switch (message_type) {
      case "offer":
        const peerConnection = new RTCPeerConnection();
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(message.payload.SDP)
        );
        const answer = peerConnection.createAnswer();
        this.ws.send(
          JSON.stringify({
            type: "answer",
            payload: {
              peerID: message.payload.peerID,
              SDP: answer,
            },
          })
        );
        this.peerList.set(message.payload.peerID, peerConnection);
        break;
      case "answer":
        pc?.setRemoteDescription(
          new RTCSessionDescription(message.payload.SDP)
        );
        break;
      case "ice-candidate":
        pc?.addIceCandidate(new RTCIceCandidate(message.event.candidate));
        break;
    }
  }

  closePeer(peerID: string) {
    const pc = this.peerList.get(peerID);
    pc?.close();
    this.peerList.delete(peerID);
  }

  closeAll() {
    this.peerList.forEach((pc, peerId) => {
      pc.close();
    });
    this.peerList.clear();
  }
}
export default PeerService;
