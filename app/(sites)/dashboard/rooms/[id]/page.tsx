"use client";

import {
  Mic,
  MicOff,
  Phone,
  BookOpen,
  Settings,
  Share2,
  MoreVertical,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [isMuted, setIsMuted] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [notes, setNotes] = useState([
    "Key Point: Importance of clear communication in team projects.",
    "Action Item: Assign roles for next sprint.",
  ]);
  const [participants, setParticipants] = useState<{ id: string; name: string }[]>([]);
  const roomId = id;

  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<{ [key: string]: RTCPeerConnection }>({});
  const audioContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function init() {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      socket.emit("join-room", roomId);
      setParticipants((prev) => [...prev, { id: "you", name: "You" }]);

      // When someone new joins
      socket.on("user-joined", async (userId: string) => {
        console.log("User joined:", userId);
        const pc = createPeerConnection(userId);
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { to: userId, sdp: offer });
      });

      socket.on("offer", async ({ from, sdp }) => {
        const pc = createPeerConnection(from);
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { to: from, sdp: answer });
      });

      socket.on("answer", async ({ from, sdp }) => {
        const pc = peersRef.current[from];
        if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      });

      socket.on("ice-candidate", ({ from, candidate }) => {
        const pc = peersRef.current[from];
        if (pc && candidate) pc.addIceCandidate(new RTCIceCandidate(candidate));
      });

      socket.on("user-left", (userId: string) => {
        console.log("User left:", userId);
        if (peersRef.current[userId]) {
          peersRef.current[userId].close();
          delete peersRef.current[userId];
        }
        setParticipants((prev) => prev.filter((p) => p.id !== userId));
      });
    }

    init();

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  function createPeerConnection(userId: string) {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peersRef.current[userId] = pc;
    setParticipants((prev) => [...prev, { id: userId, name: `User-${userId.slice(0, 4)}` }]);

    pc.onicecandidate = (e) => {
      if (e.candidate) socket.emit("ice-candidate", { to: userId, candidate: e.candidate });
    };

    pc.ontrack = (e) => {
      const audio = document.createElement("audio");
      audio.srcObject = e.streams[0];
      audio.autoplay = true;
      audioContainerRef.current?.appendChild(audio);
    };

    return pc;
  }

  const toggleMute = () => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f6f3] to-[#f0ece7] flex flex-col">
      {/* Header */}
      <div className="bg-white/30 backdrop-blur-xl border-b border-[#f4e9d8]/20 px-6 sm:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2f2a25]">Room: {roomId}</h1>
          <p className="text-[#2f2a25]/70 text-sm">
            Share this link: <span className="text-blue-600">{typeof window !== "undefined" && window.location.href}</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg hover:bg-[#f4e9d8]/50 text-[#2f2a25]">
            <Share2 size={20} />
          </button>
          <button className="p-2 rounded-lg hover:bg-[#f4e9d8]/50 text-[#2f2a25]">
            <Settings size={20} />
          </button>
          <button className="p-2 rounded-lg hover:bg-[#f4e9d8]/50 text-[#2f2a25]">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-6 sm:p-8 relative">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {participants.map((p) => (
              <div key={p.id} className="bg-white/30 backdrop-blur-xl rounded-2xl p-6 flex flex-col items-center justify-center border border-[#f4e9d8]/20">
                <div className="w-20 h-20 rounded-full bg-[#2f2a25] flex items-center justify-center mb-3">
                  <span className="text-lg font-bold text-[#f4e9d8]">
                    {p.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <p className="text-[#2f2a25] font-medium">{p.name}</p>
              </div>
            ))}
          </div>

\          <div ref={audioContainerRef}></div>

          {/* Bottom controls */}
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/30 backdrop-blur-xl rounded-xl p-2 shadow-lg border border-[#f4e9d8]/20 flex gap-6">
            <button
              className="flex items-center justify-center gap-2 px-4 py-1 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-medium transition-all"
              onClick={() => (window.location.href = "/dashboard/rooms")}
            >
              <Phone size={16} /> Leave
            </button>

            <button
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isMuted
                  ? "bg-red-500/20 text-red-400"
                  : "bg-[#2f2a25]/20 text-[#2f2a25]"
              }`}
            >
              {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <button
              onClick={() => setShowNotes(!showNotes)}
              className="w-12 h-12 rounded-full bg-[#f4e9d8]/20 text-[#2f2a25] flex items-center justify-center"
            >
              <BookOpen size={18} />
            </button>
          </div>
        </div>

        {showNotes && (
          <div className="w-80 bg-white/30 backdrop-blur-xl border-l border-[#f4e9d8]/20 flex flex-col">
            <div className="p-4 border-b border-[#f4e9d8]/20 flex items-center justify-between">
              <h2 className="font-semibold text-[#2f2a25] flex items-center gap-2">
                <BookOpen size={18} /> Auto-Generated Notes
              </h2>
              <button
                onClick={() => setShowNotes(false)}
                className="text-[#2f2a25] hover:text-[#f4e9d8]"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {notes.map((note, i) => (
                <div
                  key={i}
                  className="text-sm text-[#2f2a25]/80 bg-[#f4e9d8]/30 rounded-lg p-2"
                >
                  {note}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
