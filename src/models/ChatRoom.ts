import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    sender: { type: String, enum: ["user", "staff"], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  }
);

const ChatRoomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true },
    clientName: { type: String, default: "Khách ẩn danh" },
    clientPhone: { type: String, default: "Chưa cung cấp" },
    isOnline: { type: Boolean, default: false },
    unreadCount: { type: Number, default: 0 },
    lastMessageAt: { type: Date, default: Date.now },
    messages: [ChatMessageSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ChatRoom || mongoose.model("ChatRoom", ChatRoomSchema);
