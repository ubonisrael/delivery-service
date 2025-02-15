import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
  {
    name: { type: String, default: null }, // "General Chat" or null for private chats
    members: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    type: { type: String, enum: ["general", "private"], required: true },
  },
  { timestamps: true }
);

export default mongoose.model("ChatRoom", chatRoomSchema);
