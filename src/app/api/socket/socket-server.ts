import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server, Socket } from "socket.io";
import mongoose from "mongoose";
import ChatRoom from "../../../models/ChatRoom";

const PORT = 3003;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("[Database] MONGODB_URI is not defined in .env");
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log("[Database] Connected to MongoDB for WebSocket Chat"))
  .catch((err) => console.error("[Database] MongoDB connection error:", err));

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Stayvia Live Chat Socket Server is running!\n");
});

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3002",
      "http://127.0.0.1:3002"
    ],
    methods: ["GET", "POST"],
  },
});

interface Message {
  id: string;
  sender: "user" | "staff";
  text: string;
  timestamp: Date;
}

const adminSockets = new Set<Socket>();
const onlineRooms: Record<string, boolean> = {};

async function broadcastActiveRooms() {
  try {
    const roomsFromDb = await ChatRoom.find().sort({ lastMessageAt: -1 }).lean();
    
    const roomsList = roomsFromDb.map((r: any) => ({
      roomId: r.roomId,
      clientName: r.clientName,
      clientPhone: r.clientPhone,
      isOnline: !!onlineRooms[r.roomId],
      unreadCount: r.unreadCount,
      lastMessageAt: r.lastMessageAt,
      latestMessage: r.messages[r.messages.length - 1] || null,
    }));

    for (const adminSocket of adminSockets) {
      adminSocket.emit("active-rooms-list", roomsList);
    }
  } catch (err) {
    console.error("[Socket] Failed to broadcast active rooms:", err);
  }
}

interface CustomSocket extends Socket {
  roomId?: string;
  role?: "client" | "admin";
}

io.on("connection", (socket: CustomSocket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  socket.on("client-join", async ({ roomId, clientName, clientPhone }) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.role = "client";
    onlineRooms[roomId] = true;

    try {
      let room = await ChatRoom.findOne({ roomId });
      if (!room) {
        room = await ChatRoom.create({
          roomId,
          clientName: clientName || "Khách ẩn danh",
          clientPhone: clientPhone || "Chưa cung cấp",
          isOnline: true,
          unreadCount: 0,
          lastMessageAt: new Date(),
          messages: [
            {
              id: "greeting",
              sender: "staff",
              text: "Xin chào! Cảm ơn bạn đã ghé thăm Stayvia. Mình có thể giúp gì cho bạn hôm nay? Hãy chọn một trong các gợi ý dưới đây hoặc nhắn tin cho mình nhé!",
              timestamp: new Date(),
            },
          ],
        });
      } else {
        let hasChanges = false;
        if (clientName && clientName !== "Khách ẩn danh" && room.clientName !== clientName) {
          room.clientName = clientName;
          hasChanges = true;
        }
        if (clientPhone && clientPhone !== "Chưa cung cấp" && room.clientPhone !== clientPhone) {
          room.clientPhone = clientPhone;
          hasChanges = true;
        }
        if (hasChanges) {
          await room.save();
        }
      }

      console.log(`[Client] Joined room: ${roomId} (${room.clientName})`);
      socket.emit("chat-history", room.messages);
      broadcastActiveRooms();
    } catch (err) {
      console.error("[Socket] Error in client-join:", err);
    }
  });

  socket.on("admin-join", () => {
    socket.role = "admin";
    adminSockets.add(socket);
    console.log(`[Admin] Registered: ${socket.id}`);
    broadcastActiveRooms();
  });

  socket.on("admin-select-room", async (roomId) => {
    socket.join(roomId);
    console.log(`[Admin] Viewing room: ${roomId}`);

    try {
      const room = await ChatRoom.findOne({ roomId });
      if (room) {
        room.unreadCount = 0;
        await room.save();
        socket.emit("chat-history", room.messages);
        broadcastActiveRooms();
      }
    } catch (err) {
      console.error("[Socket] Error in admin-select-room:", err);
    }
  });

  socket.on("send-message", async ({ roomId, text, sender }) => {
    try {
      const room = await ChatRoom.findOne({ roomId });
      if (!room) return;

      const message: Message = {
        id: Math.random().toString(36).substring(2, 9),
        sender,
        text,
        timestamp: new Date(),
      };

      room.messages.push(message);
      room.lastMessageAt = new Date();

      if (sender === "user") {
        room.unreadCount += 1;
      }

      await room.save();

      io.to(roomId).emit("message", message);
      broadcastActiveRooms();
      console.log(`[Message] Room ${roomId} | ${sender}: ${text}`);

      if (sender === "user" && adminSockets.size === 0) {
        setTimeout(() => {
          io.to(roomId).emit("typing", { isTyping: true, sender: "staff" });
        }, 300);

        setTimeout(async () => {
          io.to(roomId).emit("typing", { isTyping: false, sender: "staff" });

          let replyText = "";
          const textLower = text.toLowerCase();
          
          if (textLower.includes("tim phong") || textLower.includes("tìm phòng")) {
            replyText = "Dạ! Hiện tại Stayvia đang có hàng ngàn tin đăng phòng trọ chính chủ tại Hà Nội và TP. Hồ Chí Minh. Bạn muốn tìm phòng ở khu vực Quận/Huyện nào, và mức tài chính tối đa khoảng bao nhiêu triệu để mình lọc giúp bạn nhé? 😉";
          } else if (textLower.includes("dang tin") || textLower.includes("đăng tin")) {
            replyText = "Dạ, để đăng tin cho thuê phòng, bạn hãy click vào nút **Đăng tin** màu vàng ở góc phải thanh menu phía trên (hoặc truy cập /post). Hệ thống hỗ trợ đăng tin thường miễn phí và các gói dịch vụ VIP nổi bật. Bạn đã đăng ký tài khoản chưa ạ?";
          } else if (textLower.includes("bang gia") || textLower.includes("bảng giá") || textLower.includes("bao gia") || textLower.includes("báo giá")) {
            replyText = "Dịch vụ đẩy tin & VIP của Stayvia gồm:\n• VIP 1 (Siêu Cấp): 50.000đ/ngày\n• VIP 2 (Nổi Bật): 30.000đ/ngày\n• VIP 3 (Tiết Kiệm): 15.000đ/ngày\nBạn cần hỗ trợ tư vấn chi tiết hơn về gói nào không ạ?";
          } else {
            replyText = "Cảm ơn bạn đã liên hệ Stayvia! Hiện tại các hỗ trợ viên đang bận hoặc ngoại tuyến. Bạn vui lòng liên hệ hotline **0888.022.821** hoặc để lại lời nhắn, chúng tôi sẽ phản hồi sớm nhất có thể ạ!";
          }

          const botMessage: Message = {
            id: Math.random().toString(36).substring(2, 9),
            sender: "staff",
            text: replyText,
            timestamp: new Date(),
          };

          try {
            const updatedRoom = await ChatRoom.findOne({ roomId });
            if (updatedRoom) {
              updatedRoom.messages.push(botMessage);
              updatedRoom.lastMessageAt = new Date();
              await updatedRoom.save();
              io.to(roomId).emit("message", botMessage);
              broadcastActiveRooms();
            }
          } catch (dbErr) {
            console.error("[Socket] Error saving bot reply:", dbErr);
          }
        }, 1500);
      }
    } catch (err) {
      console.error("[Socket] Error in send-message:", err);
    }
  });

  socket.on("typing", ({ roomId, isTyping, sender }) => {
    socket.to(roomId).emit("typing", { isTyping, sender });
  });

  socket.on("disconnect", () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);

    if (socket.role === "admin") {
      adminSockets.delete(socket);
    } else if (socket.role === "client" && socket.roomId) {
      const rId = socket.roomId;
      onlineRooms[rId] = false;
      console.log(`[Client] Offline: ${rId}`);
      broadcastActiveRooms();
    }
  });
});

server.listen(PORT, () => {
  console.log(`[Server] Socket.io TypeScript server is running on port ${PORT}`);
});
