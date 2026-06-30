"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LuBell, LuCheck } from "react-icons/lu";

type NotificationItem = {
  _id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/v1/user/notifications");
      const result = await res.json();
      if (res.ok && result.success) {
        setNotifications(result.data.notifications || []);
        setUnreadCount(result.data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const res = await fetch("/api/v1/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Lỗi khi đọc thông báo:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch("/api/v1/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Lỗi khi đọc tất cả thông báo:", error);
    }
  };

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case "post_approved":
        return "bg-emerald-50 text-emerald-600";
      case "post_rejected":
        return "bg-rose-50 text-rose-600";
      case "vip_expiring":
        return "bg-amber-50 text-amber-600";
      case "report_resolved":
        return "bg-cyan-50 text-cyan-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="relative inline-flex" ref={bellRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition"
        aria-label="Thông báo"
      >
        <LuBell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl z-50">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="font-semibold text-slate-800">Thông báo</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                <LuCheck size={14} />
                Đọc tất cả
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                Không có thông báo nào
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleMarkAsRead(n._id)}
                  className={`flex flex-col gap-1 border-b border-slate-50 px-4 py-3 transition hover:bg-slate-50 cursor-pointer ${
                    !n.isRead ? "bg-slate-50/50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-800">
                      {n.title}
                    </span>
                    {!n.isRead && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {n.message}
                  </p>
                  {n.link ? (
                    <Link
                      href={n.link}
                      className="mt-1 text-xs font-medium text-[#0b7ea9] hover:underline"
                      onClick={() => setIsOpen(false)}
                    >
                      Xem chi tiết
                    </Link>
                  ) : null}
                  <span className="text-[10px] text-slate-400 mt-1">
                    {new Date(n.createdAt).toLocaleDateString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
