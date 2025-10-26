// models/RoomNotes.js
import mongoose from "mongoose";

const roomNotesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who generated/saved the notes
  roomId: { type: String, required: true },
  summaryNotes: [String],
  actionItems: [String],
  recap: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("RoomNotes", roomNotesSchema);
