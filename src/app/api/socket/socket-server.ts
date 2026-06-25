import http from "http";
import { Server, Socket } from "socket.io";

const PORT = 3003;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("PhòngTốt Live Chat Socket Server is running!\n");
});

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3002", "http://127.0.0.1:3002"],
    methods: ["GET", "POST"],
  },
});

interface Message {
  id: string;
  sender: "user" | "staff";
  text: string;
  timestamp: Date;
}

interface ChatRoom {
  roomId: string;
  clientName: string;
  clientPhone: string;
  isOnline: boolean;
  unreadCount: number;
  lastMessageAt: Date;
  messages: Message[];
}

const rooms: Record<string, ChatRoom> = {};
const adminSockets = new Set<Socket>();

function broadcastActiveRooms() {
  const roomsList = Object.values(rooms).map((r) => ({
    roomId: r.roomId,
    clientName: r.clientName,
    clientPhone: r.clientPhone,
    isOnline: r.isOnline,
    unreadCount: r.unreadCount,
    lastMessageAt: r.lastMessageAt,
    latestMessage: r.messages[r.messages.length - 1] || null,
  })).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  for (const adminSocket of adminSockets) {
    adminSocket.emit("active-rooms-list", roomsList);
  }
}

interface CustomSocket extends Socket {
  roomId?: string;
  role?: "client" | "admin";
}

io.on("connection", (socket: CustomSocket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  socket.on("client-join", ({ roomId, clientName, clientPhone }) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.role = "client";

    if (!rooms[roomId]) {
      rooms[roomId] = {
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
            text: "Xin chào! Cảm ơn bạn đã ghé thăm PhòngTốt. Mình có thể giúp gì cho bạn hôm nay? Hãy chọn một trong các gợi ý dưới đây hoặc nhắn tin cho mình nhé!",
            timestamp: new Date(),
          },
        ],
      };
    } else {
      rooms[roomId].isOnline = true;
      if (clientName) rooms[roomId].clientName = clientName;
      if (clientPhone) rooms[roomId].clientPhone = clientPhone;
    }

    console.log(`[Client] Joined room: ${roomId} (${rooms[roomId].clientName})`);
    socket.emit("chat-history", rooms[roomId].messages);
    broadcastActiveRooms();
  });

  socket.on("admin-join", () => {
    socket.role = "admin";
    adminSockets.add(socket);
    console.log(`[Admin] Registered: ${socket.id}`);
    broadcastActiveRooms();
  });

  socket.on("admin-select-room", (roomId) => {
    socket.join(roomId);
    console.log(`[Admin] Viewing room: ${roomId}`);

    if (rooms[roomId]) {
      rooms[roomId].unreadCount = 0;
      socket.emit("chat-history", rooms[roomId].messages);
      broadcastActiveRooms();
    }
  });

  socket.on("send-message", ({ roomId, text, sender }) => {
    if (!rooms[roomId]) return;

    const message: Message = {
      id: Math.random().toString(36).substring(2, 9),
      sender,
      text,
      timestamp: new Date(),
    };

    rooms[roomId].messages.push(message);
    rooms[roomId].lastMessageAt = new Date();

    if (sender === "user") {
      rooms[roomId].unreadCount += 1;
    }

    io.to(roomId).emit("message", message);
    broadcastActiveRooms();
    console.log(`[Message] Room ${roomId} | ${sender}: ${text}`);

    if (sender === "user" && adminSockets.size === 0) {
      setTimeout(() => {
        io.to(roomId).emit("typing", { isTyping: true, sender: "staff" });
      }, 300);

      setTimeout(() => {
        io.to(roomId).emit("typing", { isTyping: false, sender: "staff" });

        let replyText = "";
        const textLower = text.toLowerCase();
        
        if (textLower.includes("tim phong") || textLower.includes("tìm phòng")) {
          replyText = "Dạ! Hiện tại PhòngTốt đang có hàng ngàn tin đăng phòng trọ chính chủ tại Hà Nội và TP. Hồ Chí Minh. Bạn muốn tìm phòng ở khu vực Quận/Huyện nào, và mức tài chính tối đa khoảng bao nhiêu triệu để mình lọc giúp bạn nhé? 😉";
        } else if (textLower.includes("dang tin") || textLower.includes("đăng tin")) {
          replyText = "Dạ, để đăng tin cho thuê phòng, bạn hãy click vào nút **Đăng tin** màu vàng ở góc phải thanh menu phía trên (hoặc truy cập /post). Hệ thống hỗ trợ đăng tin thường miễn phí và các gói dịch vụ VIP nổi bật. Bạn đã đăng ký tài khoản chưa ạ?";
        } else if (textLower.includes("bang gia") || textLower.includes("bảng giá") || textLower.includes("bao gia") || textLower.includes("báo giá")) {
          replyText = "Dịch vụ đẩy tin & VIP của PhòngTốt gồm:\n• VIP 1 (Siêu Cấp): 50.000đ/ngày\n• VIP 2 (Nổi Bật): 30.000đ/ngày\n• VIP 3 (Tiết Kiệm): 15.000đ/ngày\nBạn cần hỗ trợ tư vấn chi tiết hơn về gói nào không ạ?";
        } else {
          replyText = "Cảm ơn bạn đã liên hệ PhòngTốt! Hiện tại các hỗ trợ viên đang bận hoặc ngoại tuyến. Bạn vui lòng liên hệ hotline **0888.022.821** hoặc để lại lời nhắn, chúng tôi sẽ phản hồi sớm nhất có thể ạ!";
        }

        const botMessage: Message = {
          id: Math.random().toString(36).substring(2, 9),
          sender: "staff",
          text: replyText,
          timestamp: new Date(),
        };

        rooms[roomId].messages.push(botMessage);
        rooms[roomId].lastMessageAt = new Date();
        io.to(roomId).emit("message", botMessage);
        broadcastActiveRooms();
      }, 1500);
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
      if (rooms[rId]) {
        rooms[rId].isOnline = false;
        console.log(`[Client] Offline: ${rId}`);
        broadcastActiveRooms();
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`[Server] Socket.io TypeScript server is running on port ${PORT}`);
});
