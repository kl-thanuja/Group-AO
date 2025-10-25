import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: String, default: "30m" },
  members: { type: Number, default: 1 },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

export default mongoose.models.Room || mongoose.model("Room", roomSchema);