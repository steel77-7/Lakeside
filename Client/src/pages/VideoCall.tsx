import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import { PeerService } from "../utils/peer";
import { useSoc } from "../hooks/usesoc";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Users,
  MessageSquare,
  Settings,
  Phone,
  MoreHorizontal,
  Grid3x3,
  Maximize,
  Volume2,
  VolumeX,
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isMuted: boolean;
  hasVideo: boolean;
  isHost: boolean;
}

const VideoCall: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isMuted, setIsMuted] = useState(false);
  const [hasVideo, setHasVideo] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [searchParams] = useSearchParams();
  // Add participants state that was missing
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: "1",
      name: user?.name || "You",
      avatar: user?.avatar || "/api/placeholder/150/150",
      isMuted: false,
      hasVideo: true,
      isHost: true,
    },
    // Add sample participants for demo
    {
      id: "2",
      name: "John Doe",
      avatar: "/api/placeholder/150/150",
      isMuted: false,
      hasVideo: true,
      isHost: false,
    },
  ]);

  async function playVideoFromCamera() {
    try {
      const constraints = { video: hasVideo, audio: !isMuted };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return stream;
    } catch (error) {
      console.error("Error opening video camera.", error);
    }
  }
  const soc = useSoc();

  // const peerManagerRef = useRef<PeerService |null >(new PeerService(soc.current as WebSocket,playVideoFromCamera().then(r=>{return r})));
  const peerManagerRef = useRef<PeerService | null>(null);

  useEffect(() => {
    async function initializeStream() {
      peerManagerRef.current = new PeerService(
        soc.current as WebSocket,
        await playVideoFromCamera()
      );
    }
     initializeStream()
  }, []);
  useEffect(() => {
    if (!soc.current) return;
    if (soc.current?.readyState === WebSocket.OPEN) {
      soc.current.onmessage = (m: any) => {
        const message = JSON.parse(m.data);
        if (message.type === "rtc" && peerManagerRef.current !== null)
          peerManagerRef.current.handleSignal(message.data);
      };
    }
  }, [soc.current]);

  useEffect(() => {
    const socket = soc.current;
    if (!socket) return;
    if (soc.current && soc.current?.readyState === WebSocket.OPEN) {
      soc.current.send(
        JSON.stringify({
          type: "create-room",
          room_id: roomId,
        })
      );
    }
    if (peerManagerRef.current !== null) peerManagerRef.current.addPeer();
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [soc.current]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    setParticipants((prev) =>
      prev.map((p) => (p.id === "1" ? { ...p, isMuted: !isMuted } : p))
    );
  };

  const toggleVideo = () => {
    setHasVideo(!hasVideo);
    setParticipants((prev) =>
      prev.map((p) => (p.id === "1" ? { ...p, hasVideo: !hasVideo } : p))
    );
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
  };

  const leaveCall = () => {
    navigate("/dashboard");
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-white font-semibold">Room: {roomId}</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Live • {formatTime(callDuration)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>{participants.length}</span>
            </button>

            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Grid3x3 className="w-5 h-5" />
            </button>

            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Grid */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 h-full">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="relative bg-gray-800 rounded-2xl overflow-hidden"
              >
                {participant.hasVideo ? (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center mb-3 mx-auto">
                        <VideoOff className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-300 font-medium">
                        {participant.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Participant Info */}
                <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                  <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-2">
                    {participant.isMuted ? (
                      <MicOff className="w-4 h-4 text-red-400" />
                    ) : (
                      <Mic className="w-4 h-4 text-green-400" />
                    )}
                    <span className="text-white text-sm font-medium">
                      {participant.name}
                    </span>
                    {participant.isHost && (
                      <span className="text-xs bg-yellow-500 px-2 py-0.5 rounded-full text-black font-medium">
                        HOST
                      </span>
                    )}
                  </div>
                </div>

                {/* Volume Indicator */}
                <div className="absolute top-4 right-4">
                  {!participant.isMuted && (
                    <div className="bg-black/50 backdrop-blur-sm p-2 rounded-lg">
                      {Math.random() > 0.5 ? (
                        <Volume2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        {(showParticipants || showChat) && (
          <div className="w-80 bg-gray-800/50 backdrop-blur-lg border-l border-gray-700/50">
            {/* Sidebar Content */}
            <div className="p-4">
              {showParticipants && (
                <div>
                  <h3 className="text-white font-semibold mb-4">
                    Participants ({participants.length})
                  </h3>
                  <div className="space-y-3">
                    {participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg"
                      >
                        <img
                          src={participant.avatar}
                          alt={participant.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">
                              {participant.name}
                            </span>
                            {participant.isHost && (
                              <span className="text-xs bg-yellow-500 px-2 py-0.5 rounded-full text-black font-medium">
                                HOST
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            {participant.isMuted ? (
                              <MicOff className="w-3 h-3 text-red-400" />
                            ) : (
                              <Mic className="w-3 h-3 text-green-400" />
                            )}
                            {participant.hasVideo ? (
                              <Video className="w-3 h-3 text-green-400" />
                            ) : (
                              <VideoOff className="w-3 h-3 text-red-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800/90 backdrop-blur-lg border-t border-gray-700/50 px-6 py-4">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all duration-200 ${
              isMuted
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all duration-200 ${
              !hasVideo
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {hasVideo ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full transition-all duration-200 ${
              isScreenSharing
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            <Monitor className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-200"
          >
            <MessageSquare className="w-6 h-6 text-white" />
          </button>

          <button className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-200">
            <Settings className="w-6 h-6 text-white" />
          </button>

          <button className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-200">
            <MoreHorizontal className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={leaveCall}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-200 ml-6"
          >
            <Phone className="w-6 h-6 text-white transform rotate-[135deg]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
