import express from "express";
import Room from "../models/Rooms.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { userId, name, duration } = req.body;

    if (!userId || !name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newRoom = new Room({
      name,
      duration,
      createdBy: user._id,
    });

    await newRoom.save();
    res.status(201).json({ message: "Room created successfully", room: newRoom });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.createdBy.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this room" });
    }

    await room.deleteOne();
    res.status(200).json({ message: "Room deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
