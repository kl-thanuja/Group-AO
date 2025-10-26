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
import Vapi from "@vapi-ai/web";

const socket = io("http://localhost:8000", { transports: ["websocket"] });

export default function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const roomId = id;

  const [isMuted, setIsMuted] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [notes, setNotes] = useState<string[]>([
    "Key Point: Importance of clear communication in team projects.",
    "Action Item: Assign roles for next sprint.",
  ]);
  const [participants, setParticipants] = useState<
    { id: string; name: string }[]
  >([]);
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<{ [key: string]: RTCPeerConnection }>({});
  const audioContainerRef = useRef<HTMLDivElement | null>(null);

  const [vapi, setVapi] = useState<any>(null);
  const [status, setStatus] = useState<
    "idle" | "ready" | "starting" | "live" | "processing" | "ended"
  >("idle");
  const [transcript, setTranscript] = useState("");
  const transcriptRef = useRef("");
  const topic = `Room ${roomId}`;

  const speechBufferRef = useRef("");
  const speechDebounceTimerRef = useRef<number | null>(null);
  const SPEECH_IDLE_MS = 8000;

  useEffect(() => {
    const vapiInstance = new Vapi("bd2d2360-14fd-48f9-8381-821bad37d79d");
    setVapi(vapiInstance);

    vapiInstance.on("call-start", () => {
      setStatus("live");
    });

    vapiInstance.on("call-end", () => {
      setStatus("ended");
      // send any remaining buffered speech immediately
      flushSpeechBufferToServer();
    });

    vapiInstance.on("message", (message: any) => {
      if (message.type === "transcript") {
        // accumulate transcript locally (UI)
        const line = `${message.role === "user" ? "You" : "AI"}: ${
          message.transcript
        }`;
        transcriptRef.current += `\n${line}`;
        setTranscript(transcriptRef.current);

        // append to buffer and debounce send to server
        appendToSpeechBuffer(message.transcript);
      }
    });

    setStatus("ready");
    return () => {
      try {
        vapiInstance.stop();
      } catch {}
    };
  }, []);

  async function requestMicPermission() {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      alert("Please enable microphone access for this feature to work.");
    }
  }

  async function startSession() {
    if (!vapi) return;
    await requestMicPermission();
    setStatus("starting");
    await vapi.start("05d5b1c8-a323-42c2-9437-9122df2bf4ef", {
      metadata: { topic },
    });
  }

  async function endSession() {
    if (!vapi) return;
    vapi.stop();
    setStatus("processing");
    flushSpeechBufferToServer();
    await generateFinalNotes();
  }

  async function generateFinalNotes() {
    console.log("dwfr");
    try {
      const res = await fetch("http://localhost:8000/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json();
      socket.on("receive-notes", (notes) => {
        socket.emit("send-notes", { roomId, notes });

        socket.on("receive-notes", (allNotes) => {
          console.log("All notes in room:", allNotes);
        });
      });
      localStorage.setItem(`finalNotes-${roomId}`, JSON.stringify(data));
      setShowNotes(true);
      window.location.href = "/dashboard/notes";
    } catch {
      alert("Failed to generate notes.");
    }
  }

  function appendToSpeechBuffer(fragment: string) {
    speechBufferRef.current += (speechBufferRef.current ? "\n" : "") + fragment;

    // reset debounce timer
    if (speechDebounceTimerRef.current)
      window.clearTimeout(speechDebounceTimerRef.current);
    speechDebounceTimerRef.current = window.setTimeout(() => {
      flushSpeechBufferToServer();
    }, SPEECH_IDLE_MS);
  }

  function flushSpeechBufferToServer() {
    const buffered = speechBufferRef.current;
    if (buffered && buffered.trim().length > 0) {
      socket.emit("user-speech", { text: buffered });
      speechBufferRef.current = "";
    }
    if (speechDebounceTimerRef.current) {
      window.clearTimeout(speechDebounceTimerRef.current);
      speechDebounceTimerRef.current = null;
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser({
        id: parsed._id || parsed.id || "me",
        name: parsed.name || "You",
      });
    } else {
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    let stream: MediaStream | null = null;

    async function init() {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      socket.emit("join-room", { roomId, user });

      setParticipants((prev) => {
        if (prev.find((p) => p.id === user.id)) return prev;
        return [...prev, { id: user.id, name: user.name }];
      });

      socket.on(
        "existing-users",
        async (others: { userId: string; userName: string }[]) => {
          for (const o of others) {
            const pc = createPeerConnection(o.userId);
            if (stream)
              stream.getTracks().forEach((t) => pc.addTrack(t, stream));
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit("offer", { to: o.userId, sdp: offer });
            setParticipants((prev) => [
              ...prev.filter((p) => p.id !== o.userId),
              { id: o.userId, name: o.userName },
            ]);
          }
        }
      );

      // existing notes
      socket.on("existing-notes", (existingNotes: string[]) => {
        if (existingNotes && Array.isArray(existingNotes)) {
          setNotes(existingNotes);
        }
      });

      socket.on(
        "user-joined",
        async (data: { userId: string; userName: string }) => {
          // a new user joined AFTER me — create peer, add tracks, and send offer
          const pc = createPeerConnection(data.userId);
          if (stream) stream.getTracks().forEach((t) => pc.addTrack(t, stream));
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { to: data.userId, sdp: offer });
          setParticipants((prev) => [
            ...prev.filter((p) => p.id !== data.userId),
            { id: data.userId, name: data.userName },
          ]);
        }
      );

      socket.on("offer", async ({ from, sdp, userName }) => {
        const pc = createPeerConnection(from);
        if (stream) stream.getTracks().forEach((t) => pc.addTrack(t, stream));
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { to: from, sdp: answer });
        setParticipants((prev) => [
          ...prev.filter((p) => p.id !== from),
          { id: from, name: userName || `User-${from.slice(0, 4)}` },
        ]);
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
        if (peersRef.current[userId]) {
          peersRef.current[userId].close();
          delete peersRef.current[userId];
        }
        setParticipants((prev) => prev.filter((p) => p.id !== userId));
      });

      socket.on(
        "new-notes",
        (newNotes: { note: string; reason?: string }[]) => {
          // server sends [{note, reason}, ...] — map to readable strings (you can adjust)
          if (Array.isArray(newNotes) && newNotes.length) {
            const mapped = newNotes.map((n) =>
              n.reason ? `${n.note} — ${n.reason}` : `${n.note}`
            );
            setNotes((prev) => [...prev, ...mapped]);
          }
        }
      );

      // agent-response transcripts broadcast from server (optional)
      socket.on("agent-response", ({ text }: { text: string }) => {
        // do not auto-send this to AI again; just show / store if needed
        // we already show transcriptRef locally; keep this for synchronized transcript display
        // (optional) setTranscript(text); // uncomment if you want server transcript to overwrite local
      });

      // automatically start Vapi listening when joining
      await startSession();
    }

    init();

    return () => {
      // cleanup
      try {
        socket.off("existing-users");
        socket.off("existing-notes");
        socket.off("user-joined");
        socket.off("offer");
        socket.off("answer");
        socket.off("ice-candidate");
        socket.off("user-left");
        socket.off("new-notes");
        socket.off("agent-response");
      } catch {}
      // close peers
      Object.values(peersRef.current).forEach((pc) => pc.close());
      peersRef.current = {};
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      endSession();
    };
  }, [roomId, user]);

  function createPeerConnection(userId: string) {
    // avoid duplicate
    if (peersRef.current[userId]) return peersRef.current[userId];

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peersRef.current[userId] = pc;

    pc.onicecandidate = (e) => {
      if (e.candidate)
        socket.emit("ice-candidate", { to: userId, candidate: e.candidate });
    };

    pc.ontrack = (e) => {
      const audio = document.createElement("audio");
      audio.srcObject = e.streams[0];
      audio.autoplay = true;
      audioContainerRef.current?.appendChild(audio);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        pc.close();
        delete peersRef.current[userId];
      }
    };

    return pc;
  }

  const toggleMute = () => {
    const stream = localStreamRef.current;
    if (stream) {
      stream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setIsMuted(!isMuted);
    }
  };

  if (!user)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading user...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f6f3] to-[#f0ece7] flex flex-col">
      {/* Header */}
      <div className="bg-white/30 backdrop-blur-xl border-b border-[#f4e9d8]/20 px-6 sm:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2f2a25]">Room: {roomId}</h1>
          <p className="text-[#2f2a25]/70 text-sm">
            Share this link:{" "}
            <span className="text-blue-600">
              {typeof window !== "undefined" && window.location.href}
            </span>
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

      {/* Main Section */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-6 sm:p-8 relative">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {participants.map((p) => (
              <div
                key={p.id}
                className="bg-white/30 backdrop-blur-xl rounded-2xl p-6 flex flex-col items-center justify-center border border-[#f4e9d8]/20"
              >
                <div className="w-20 h-20 rounded-full bg-[#2f2a25] flex items-center justify-center mb-3">
                  <span className="text-lg font-bold text-[#f4e9d8]">
                    {p.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <p className="text-[#2f2a25] font-medium">{p.name}</p>
              </div>
            ))}

            {/* AI Avatar */}
            <div className="bg-white/30 backdrop-blur-xl rounded-2xl p-6 flex flex-col items-center justify-center border border-[#f4e9d8]/20 animate-pulse">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-3 text-white font-bold">
                AI
              </div>
              <p className="text-[#2f2a25] font-medium">Quoraid AI</p>
              <p className="text-xs text-[#2f2a25]/60">{status}</p>
            </div>
          </div>

          <div ref={audioContainerRef}></div>

          {/* Controls */}
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/30 backdrop-blur-xl rounded-xl p-2 shadow-lg border border-[#f4e9d8]/20 flex gap-6">
            <button
              className="flex items-center justify-center gap-2 px-4 py-1 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-medium transition-all"
              onClick={generateFinalNotes}
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
          </div>
        )}
      </div>
    </div>
  );
}
