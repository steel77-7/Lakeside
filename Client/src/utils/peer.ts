import { v4 as uuidv4 } from "uuid";

export class PeerService {
  private ws: WebSocket;
  private peerList: Map<string, RTCPeerConnection>;
  private localStream: MediaStream | null = null;
  public remoteStreams: Map<string, MediaStream> = new Map();

  constructor(soc: WebSocket, localStream?: MediaStream) {
    this.peerList = new Map<string, RTCPeerConnection>();
    this.ws = soc;
    this.localStream = localStream || null;
  }



  
  // Add local stream to be shared with peers
  async addLocalStream(stream: MediaStream) {
    this.localStream = stream;
    
    // Add tracks to all existing peer connections
    this.peerList.forEach((pc) => {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    });
  }

  // Remove local stream
  removeLocalStream() {
    if (this.localStream) {
      this.peerList.forEach((pc) => {
        const senders = pc.getSenders();
        senders.forEach((sender) => {
          if (sender.track && this.localStream?.getTracks().includes(sender.track)) {
            pc.removeTrack(sender);
          }
        });
      });
      this.localStream = null;
    }
  }

  // Get remote stream for a specific peer
  getRemoteStream(peerID: string): MediaStream | null {
    return this.remoteStreams.get(peerID) || null;
  }

  // Get all remote streams
  getAllRemoteStreams(): Map<string, MediaStream> {
    return this.remoteStreams;
  }

  private setupTrackHandlers(pc: RTCPeerConnection, peerID: string) {
    // Handle incoming remote tracks
    pc.ontrack = (event: RTCTrackEvent) => {
      const remoteStream = event.streams[0];
      if (remoteStream) {
        this.remoteStreams.set(peerID, remoteStream);
        window.dispatchEvent(new CustomEvent('remoteStreamAdded', {
          detail: { peerID, stream: remoteStream }
        }));
      }
    };

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }
  }

  async addPeer() {
    const peerID = uuidv4();

    const pc = new RTCPeerConnection();
    console.log("add peer");
    this.setupTrackHandlers(pc, peerID);

    pc.onicecandidate = (event: any) => {
      if (event.candidate && this.ws.readyState === WebSocket.OPEN) {
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
       console.log(`during offer peer :${peerID}`,pc)

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "offer",
          payload: {
            peerID,
            sdp: offer,
          },
        })
      );
    }
    
    this.peerList.set(peerID, pc);
  }

  async handleSignal(message: any) {
   // console.log(message)
    let message_type = message.type;
    let pc = this.peerList.get(message.payload.peerID);
    //console.log(pc );
    //console.log(message)
   /*  if (!pc) {
      console.log("peer connection not found ");
      return;
    } */
    
    switch (message_type) {
      case "offer":
        const peerConnection = new RTCPeerConnection();
       // console.log(message.payload.sdp)
       console.log('offer')
        this.setupTrackHandlers(peerConnection, message.payload.peerID);
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(message.payload.sdp)
        );
        
        this.peerList.set(message.payload.peer,peerConnection)
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
        
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(
            JSON.stringify({
              type: "answer",
              payload: {
                peerID: message.payload.peerID,
                sdp: answer,
              },
            })
          );
        }
        
        this.peerList.set(message.payload.peerID, peerConnection);
        break;
        
      case "answer":
        if( !pc )return 
       // if(pc.connectionState === )
    console.log(`during asnwer peer :${message.payload.peerID}`,pc)
       
        await pc?.setRemoteDescription(
          new RTCSessionDescription(message.payload.sdp)
        );
        break;
        
      case "ice-candidate":if(!pc) return 
        await pc?.addIceCandidate(new RTCIceCandidate(message.event.candidate));
        break;
    }
  }

  closePeer(peerID: string) {
    const pc = this.peerList.get(peerID);
    pc?.close();
    this.peerList.delete(peerID);
    
    this.remoteStreams.delete(peerID);
    
    window.dispatchEvent(new CustomEvent('remoteStreamRemoved', {
      detail: { peerID }
    }));
  }

  closeAll() {
    this.peerList.forEach((pc, peerId) => {
      pc.close();
    });
    this.peerList.clear();
    
    this.remoteStreams.clear();
    
    this.removeLocalStream();
  }
}

export default PeerService;



