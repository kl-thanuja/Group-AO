'use client';

import { useState } from "react";
import { Plus, Users, Clock, Trash2, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function RoomsPage() {
  const [rooms, setRooms] = useState([
    { id: 1, name: "Engineering Sync", duration: "45m" },
    { id: 2, name: "Product Planning", duration: "30m" },
    { id: 3, name: "Design Review", duration: "60m" },
    { id: 4, name: "Team Standup",  duration: "15m" },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDuration, setNewRoomDuration] = useState("30m");

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      setRooms([
        ...rooms,
        {
          id: rooms.length + 1,
          name: newRoomName,
          duration: newRoomDuration,
        },
      ]);
      setNewRoomName("");
      setNewRoomDuration("30m");
      setIsDialogOpen(false);
    }
  };

  const handleDeleteRoom = (id: number) => {
    setRooms(rooms.filter((room) => room.id !== id));
  };

  return (
    <div className="p-6 sm:p-8 bg-gradient-to-b from-[#f8f6f3] to-[#f0ece7]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#2f2a25] mb-2">Rooms</h1>
          <p className="text-[#2f2a25]/70">Manage and join your collaboration rooms</p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="px-6 py-2 rounded-lg bg-[#2f2a25] text-[#f4e9d8] font-medium hover:bg-[#f4e9d8] hover:text-[#2f2a25] flex items-center gap-2 transition-all duration-300"
        >
          <Plus size={20} /> Create Room
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-white/30 backdrop-blur-xl p-6 rounded-2xl hover:shadow-xl transition-all duration-300 border border-[#f4e9d8]/20 relative group"
          >
            <h3 className="text-lg font-bold text-[#2f2a25] mb-4">{room.name}</h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-[#2f2a25]/70 text-sm">
                <Clock size={16} /> {room.duration} average
              </div>
            </div>
            <Link
              href={`/dashboard/rooms/${room.id}`}
              className="block w-full py-2 rounded-lg bg-[#2f2a25] text-[#f4e9d8] font-medium hover:bg-[#f4e9d8] hover:text-[#2f2a25] text-center transition-all duration-300"
            >
              Join Room
            </Link>
            <button
              onClick={() => handleDeleteRoom(room.id)}
              className="absolute top-4 right-4 p-2 rounded-lg text-[#2f2a25]/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 opacity-0 group-hover:opacity-100"
              title="Delete Room"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white/30 backdrop-blur-xl border border-[#f4e9d8]/20 rounded-2xl shadow-xl sm:max-w-[360px] p-6">
          <DialogHeader className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold text-[#2f2a25]">
              Create New Room
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-3">
            <div>
              <label className="text-sm font-semibold text-[#2f2a25] mb-1 block">Room Name</label>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Enter room name"
                className="w-full px-3 py-2 rounded-lg bg-white/30 backdrop-blur-xl text-[#2f2a25] placeholder:text-[#2f2a25]/50 focus:outline-none focus:ring-2 focus:ring-[#f4e9d8] text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#2f2a25] mb-1 block">Duration</label>
              <select
                value={newRoomDuration}
                onChange={(e) => setNewRoomDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/30 backdrop-blur-xl text-[#2f2a25] focus:outline-none focus:ring-2 focus:ring-[#f4e9d8] text-sm"
              >
                <option value="15m">15 minutes</option>
                <option value="30m">30 minutes</option>
                <option value="45m">45 minutes</option>
                <option value="60m">60 minutes</option>
              </select>
            </div>
            <Button
              onClick={handleCreateRoom}
              disabled={!newRoomName.trim()}
              className="mt-2 px-6 py-2 rounded-lg bg-[#2f2a25] text-[#f4e9d8] font-medium hover:bg-[#f4e9d8] hover:text-[#2f2a25] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Room
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}