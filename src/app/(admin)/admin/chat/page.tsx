"use client";

import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { IoSendSharp, IoCallOutline, IoPersonOutline, IoChatbubblesOutline } from "react-icons/io5";

type Message = {
  id: string;
  sender: "user" | "staff";
  text: string;
  timestamp: string | Date;
};

type ChatRoom = {
  roomId: string;
  clientName: string;
  clientPhone: string;
  isOnline: boolean;
  unreadCount: number;
  lastMessageAt: string | Date;
  latestMessage: Message | null;
};

export default function AdminChatPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isClientTyping, setIsClientTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Socket connection as Admin
  useEffect(() => {
    const socket = io("http://localhost:3003");
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Admin Socket] Connected:", socket.id);
      socket.emit("admin-join");
    });

    socket.on("active-rooms-list", (roomsList: any[]) => {
      setRooms(roomsList);
    });

    socket.on("chat-history", (history: any[]) => {
      setMessages(
        history.map((m) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }))
      );
    });

    socket.on("message", (msg: any) => {
      // If the incoming message belongs to the currently active room, append it
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [
          ...prev,
          {
            ...msg,
            timestamp: new Date(msg.timestamp),
          },
        ];
      });
    });

    socket.on("typing", ({ isTyping: typing, sender }: { isTyping: boolean; sender: string }) => {
      if (sender === "user") {
        setIsClientTyping(typing);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Sync messages when active room changes
  useEffect(() => {
    if (selectedRoomId && socketRef.current) {
      socketRef.current.emit("admin-select-room", selectedRoomId);
      setIsClientTyping(false);
    } else {
      setMessages([]);
    }
  }, [selectedRoomId]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isClientTyping]);

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || !selectedRoomId || !socketRef.current) return;

    const text = inputValue.trim();

    // Stop typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socketRef.current.emit("typing", { roomId: selectedRoomId, isTyping: false, sender: "staff" });

    // Send message
    socketRef.current.emit("send-message", {
      roomId: selectedRoomId,
      text,
      sender: "staff",
    });

    setInputValue("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    if (!selectedRoomId || !socketRef.current) return;

    // Emit typing state
    socketRef.current.emit("typing", { roomId: selectedRoomId, isTyping: true, sender: "staff" });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && selectedRoomId) {
        socketRef.current.emit("typing", { roomId: selectedRoomId, isTyping: false, sender: "staff" });
      }
    }, 2000);
  };

  const formatMessageTime = (time: string | Date) => {
    const date = new Date(time);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeDifference = (time: string | Date) => {
    const date = new Date(time);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const activeRoom = rooms.find((r) => r.roomId === selectedRoomId);

  const filteredRooms = rooms.filter((r) =>
    r.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.clientPhone.includes(searchQuery)
  );

  return (
    <div className="flex h-[calc(100vh-140px)] w-full gap-5 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
      
      {/* LEFT COLUMN: Sidebar Chat Rooms List */}
      <aside className="flex w-96 flex-col border-r border-slate-100 bg-slate-50/30">
        
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <h2 className="text-lg font-extrabold text-slate-800 mb-3 font-display">Hộp thư hỗ trợ</h2>
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng, SĐT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#0b7ea9] transition"
          />
        </div>

        {/* Rooms Scroll List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <IoChatbubblesOutline className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">Không tìm thấy hội thoại</p>
            </div>
          ) : (
            filteredRooms.map((room) => {
              const isSelected = room.roomId === selectedRoomId;
              const hasUnread = room.unreadCount > 0;

              return (
                <button
                  key={room.roomId}
                  onClick={() => handleSelectRoom(room.roomId)}
                  type="button"
                  className={`w-full text-left p-3.5 rounded-2xl flex items-start gap-3 transition-all duration-200 ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                      : "hover:bg-slate-100 text-slate-700 bg-white/50 border border-slate-100/50 mb-1"
                  }`}
                >
                  {/* User Initial Circle / Avatar */}
                  <div className="relative shrink-0">
                    <div className={`h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold shadow-inner uppercase ${
                      isSelected 
                        ? "bg-white/10 text-white border border-white/20" 
                        : "bg-slate-200/80 text-slate-700"
                    }`}>
                      {room.clientName.slice(0, 2)}
                    </div>
                    {/* Online status indicator dot */}
                    <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 ${
                      isSelected ? "border-slate-900" : "border-white"
                    } ${room.isOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-300"}`} />
                  </div>

                  {/* Room Details Snippet */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className={`text-sm font-bold truncate leading-tight ${isSelected ? "text-white" : "text-slate-950"}`}>
                        {room.clientName}
                      </h4>
                      <span className={`text-[10px] whitespace-nowrap ml-1 ${isSelected ? "text-slate-400" : "text-slate-400"}`}>
                        {formatTimeDifference(room.lastMessageAt)}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${isSelected ? "text-slate-300" : "text-slate-500"} ${hasUnread ? "font-semibold text-slate-800" : ""}`}>
                      {room.latestMessage ? room.latestMessage.text : "Chưa có tin nhắn"}
                    </p>
                  </div>

                  {/* Unread Message Badge */}
                  {hasUnread && (
                    <span className="shrink-0 h-5 min-w-[20px] px-1 bg-[#ef2f3d] text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-sm">
                      {room.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* RIGHT COLUMN: Chat Messages Pane */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/20">
        {selectedRoomId && activeRoom ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-[#0b7ea9] border border-slate-200/50 uppercase select-none">
                    {activeRoom.clientName.slice(0, 2)}
                  </div>
                  <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                    activeRoom.isOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-300"
                  }`} />
                </div>
                <div>
                  <h3 className="font-extrabold text-[15px] text-slate-900 leading-tight flex items-center gap-2">
                    <span>{activeRoom.clientName}</span>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeRoom.isOnline 
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {activeRoom.isOnline ? "Đang trực tuyến" : "Ngoại tuyến"}
                    </span>
                  </h3>
                  <p className="text-[12px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <IoCallOutline className="h-3 w-3" />
                    <span>{activeRoom.clientPhone}</span>
                  </p>
                </div>
              </div>
              
              <div className="text-right text-xs text-slate-400 font-mono">
                <span>Room ID: {activeRoom.roomId}</span>
              </div>
            </div>

            {/* Conversation Messages Scroll List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 flex flex-col min-h-0">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[75%] ${
                    msg.sender === "staff" ? "self-end items-end" : "self-start items-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-[14.5px] leading-relaxed shadow-sm whitespace-pre-line ${
                      msg.sender === "staff"
                        ? "bg-slate-900 text-white rounded-tr-none"
                        : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {formatMessageTime(msg.timestamp)}
                  </span>
                </div>
              ))}

              {/* Typing Indicator */}
              {isClientTyping && (
                <div className="self-start flex flex-col items-start max-w-[75%]">
                  <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Footer Form */}
            <form
              onSubmit={handleSendMessage}
              className="border-t border-slate-100 p-4 bg-white flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={`Nhập phản hồi gửi đến ${activeRoom.clientName}...`}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="h-11 w-11 flex items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-slate-800 active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:pointer-events-none transition-all shadow-sm"
                title="Gửi phản hồi"
              >
                <IoSendSharp className="h-4.5 w-4.5" />
              </button>
            </form>
          </>
        ) : (
          // Empty State
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-4 shadow-inner">
              <IoPersonOutline className="h-8 w-8" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-[16px] mb-1 font-display">Chưa có hội thoại nào được chọn</h3>
            <p className="text-sm max-w-sm text-center">Hãy click vào một phiên hỗ trợ bên danh sách trái để bắt đầu nhắn tin thời gian thực với khách hàng.</p>
          </div>
        )}
      </main>
    </div>
  );
}
