"use client";

import React, { useState, useEffect, useRef } from "react";
import { IoChatbubblesSharp, IoCloseOutline, IoSendSharp, IoTrashOutline } from "react-icons/io5";
import { io, Socket } from "socket.io-client";

type Message = {
  id: string;
  sender: "user" | "staff";
  text: string;
  timestamp: Date;
};

const QUICK_REPLIES = [
  { id: "find_room", text: "Tôi muốn tìm phòng trọ 🏠" },
  { id: "post_room", text: "Tôi muốn đăng tin cho thuê 📝" },
  { id: "price_info", text: "Bảng giá dịch vụ tin đăng 💰" },
  { id: "call_staff", text: "Gặp nhân viên trực tiếp 📞" },
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [roomId, setRoomId] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<{ fullName?: string; phone?: string } | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch logged in user info if any
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/v1/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setCurrentUser({
              fullName: data.data.fullName,
              phone: data.data.phone,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load user info:", err);
      }
    };
    fetchUser();
  }, []);

  // Initialize Room ID and Socket connection
  useEffect(() => {
    let id = localStorage.getItem("stayvia_chat_room_id");
    if (!id) {
      id = "room_" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("stayvia_chat_room_id", id);
    }
    setRoomId(id);

    // Connect to Socket.io server
    const socket = io("http://localhost:3003");
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket] Client connected:", socket.id);
      
      // Register with the socket server
      socket.emit("client-join", {
        roomId: id,
        clientName: currentUser?.fullName || "Khách ẩn danh",
        clientPhone: currentUser?.phone || "Chưa cung cấp",
      });
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
      setMessages((prev) => {
        // Prevent duplicate messages
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [
          ...prev,
          {
            ...msg,
            timestamp: new Date(msg.timestamp),
          },
        ];
      });

      if (!isOpen && msg.sender === "staff") {
        setHasNewMessage(true);
      }
    });

    socket.on("typing", ({ isTyping: typing, sender }: { isTyping: boolean; sender: string }) => {
      if (sender === "staff") {
        setIsTyping(typing);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  // Scroll to bottom whenever messages or typing state changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessage(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện này không?")) {
      setMessages([]);
      localStorage.removeItem("stayvia_chat_history");
      
      // We can reset room ID to start a completely fresh session
      const newId = "room_" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("stayvia_chat_room_id", newId);
      setRoomId(newId);

      if (socketRef.current) {
        socketRef.current.emit("client-join", {
          roomId: newId,
          clientName: currentUser?.fullName || "Khách ẩn danh",
          clientPhone: currentUser?.phone || "Chưa cung cấp",
        });
      }
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || !socketRef.current) return;

    const text = inputValue.trim();
    
    // Stop typing immediately
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socketRef.current.emit("typing", { roomId, isTyping: false, sender: "user" });

    // Send via socket
    socketRef.current.emit("send-message", {
      roomId,
      text,
      sender: "user",
    });

    setInputValue("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    if (!socketRef.current) return;

    // Emit typing indicator
    socketRef.current.emit("typing", { roomId, isTyping: true, sender: "user" });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit("typing", { roomId, isTyping: false, sender: "user" });
      }
    }, 2000);
  };

  const handleQuickReply = (text: string) => {
    if (!socketRef.current) return;

    // Send reply text as user message
    socketRef.current.emit("send-message", {
      roomId,
      text,
      sender: "user",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={handleToggleChat}
        type="button"
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 group focus:outline-none ${
          isOpen
            ? "bg-slate-700 hover:bg-slate-800 rotate-90"
            : "bg-gradient-to-tr from-[#045a84] via-[#0b7ea9] to-[#25c3c8] hover:shadow-[0_8px_24px_rgba(37,195,200,0.4)]"
        }`}
        title="Chat với nhân viên hỗ trợ"
        aria-label="Toggle chat widget"
      >
        {isOpen ? (
          <IoCloseOutline className="h-7 w-7 transition-transform duration-300" />
        ) : (
          <div className="relative">
            <IoChatbubblesSharp className="h-6 w-6 animate-pulse group-hover:scale-105" />
            {hasNewMessage && (
              <span className="absolute -top-2 -right-2 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border border-white"></span>
              </span>
            )}
          </div>
        )}
      </button>

      {/* Chat Window Modal */}
      <div
        className={`fixed bottom-24 right-6 z-50 flex h-[620px] w-[500px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] flex-col rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-5 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#045a84] to-[#0b7ea9] p-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white font-black text-lg border border-white/20 select-none">
                SV
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#045a84] animate-pulse"></span>
            </div>
            <div>
              <h3 className="font-semibold text-[15px] leading-tight font-display">Hỗ Trợ Stayvia</h3>
              <p className="text-[12px] text-teal-100 flex items-center gap-1">
                <span>Trực tuyến 24/7</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearHistory}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              title="Xóa lịch sử chat"
              type="button"
            >
              <IoTrashOutline className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              title="Đóng chat"
              type="button"
            >
              <IoCloseOutline className="h-5.5 w-5.5" />
            </button>
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-4 flex flex-col min-h-0">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[82%] ${
                msg.sender === "user" ? "self-end items-end" : "self-start items-start"
              }`}
            >
              <div
                className={`px-3.5 py-2.5 rounded-2xl text-[14.5px] leading-relaxed shadow-sm whitespace-pre-line ${
                  msg.sender === "user"
                    ? "bg-[#25c3c8] text-white rounded-tr-none"
                    : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 px-1">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="self-start flex flex-col items-start max-w-[82%]">
              <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}

          {/* Bottom element for auto scroll */}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Quick Replies */}
        {messages.length <= 1 && !isTyping && (
          <div className="bg-slate-50 px-4 pb-3 flex flex-wrap gap-1.5 select-none">
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply.id}
                onClick={() => handleQuickReply(reply.text)}
                type="button"
                className="text-xs bg-white text-slate-600 border border-slate-200/80 px-2.5 py-1.5 rounded-full hover:bg-[#ecfdfe] hover:text-[#0b7ea9] hover:border-[#25c3c8] transition-all font-medium text-left"
              >
                {reply.text}
              </button>
            ))}
          </div>
        )}

        {/* Input Form */}
        <form
          onSubmit={handleSendMessage}
          className="border-t border-slate-100 p-3 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Nhập tin nhắn gửi đến hỗ trợ..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-[14.5px] text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#25c3c8]/40 focus:border-[#25c3c8] transition-all"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#045a84] text-white hover:bg-[#0b7ea9] active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:pointer-events-none transition-all shadow-sm shadow-[#045a84]/20"
            title="Gửi tin nhắn"
          >
            <IoSendSharp className="h-4.5 w-4.5" />
          </button>
        </form>
      </div>
    </>
  );
}
