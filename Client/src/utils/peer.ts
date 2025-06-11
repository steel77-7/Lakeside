/* 


type SignalMessage =
  | { type: 'offer'; from: string; sdp: RTCSessionDescriptionInit }
  | { type: 'answer'; from: string; sdp: RTCSessionDescriptionInit }
  | { type: 'ice-candidate'; from: string; candidate: RTCIceCandidateInit };

type RemoteStreamCallback = (peerId: string, stream: MediaStream) => void;

export class PeerManager {
  private localStream: MediaStream;
  private peers: Map<string, RTCPeerConnection> = new Map();
  private onRemoteStream: RemoteStreamCallback;
  private sendSignal: (to: string, message: SignalMessage) => void;

  constructor(
    localStream: MediaStream,
    onRemoteStream: RemoteStreamCallback,
    sendSignal: (to: string, message: SignalMessage) => void
  ) {
    this.localStream = localStream;
    this.onRemoteStream = onRemoteStream;
    this.sendSignal = sendSignal;
  }

  addPeer(peerId: string, isInitiator: boolean) {
    if (this.peers.has(peerId)) return;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });

    this.localStream.getTracks().forEach(track => {
      pc.addTrack(track, this.localStream);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal(peerId, {
          type: 'ice-candidate',
          from: peerId,
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      this.onRemoteStream(peerId, stream);
    };

    this.peers.set(peerId, pc);

    if (isInitiator) {
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .then(() => {
          this.sendSignal(peerId, {
            type: 'offer',
            from: peerId,
            sdp: pc.localDescription!
          });
        });
    }
  }

  async handleSignal(from: string, message: SignalMessage) {
    let pc = this.peers.get(from);

    if (!pc) {
      this.addPeer(from, false);
      pc = this.peers.get(from)!;
    }

    if (message.type === 'offer') {
      await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      this.sendSignal(from, {
        type: 'answer',
        from,
        sdp: pc.localDescription!
      });
    } else if (message.type === 'answer') {
      await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
    } else if (message.type === 'ice-candidate') {
      await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
  }

  closePeer(peerId: string) {
    const pc = this.peers.get(peerId);
    if (pc) {
      pc.close();
      this.peers.delete(peerId);
    }
  }

  closeAll() {
    this.peers.forEach((pc, peerId) => {
      pc.close();
    });
    this.peers.clear();
  }
}
 */



export class PeerService {
  private peer: RTCPeerConnection;
  constructor() {

   
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      });
    
  }

  async getAnswer(offer:RTCSessionDescription) {
    if (this.peer) {
      await this.peer.setRemoteDescription(offer);
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(ans));
      return ans;
    }                   
  }

  async setLocalDescription(ans:RTCSessionDescription) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
  }

  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  }
}

export default new PeerService();
