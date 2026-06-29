"use client";

import { useEffect, useState } from "react";

export function SaveRoomButton({ roomId }: { roomId: string }) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSaved = async () => {
      try {
        const res = await fetch(`/api/v1/user/saved-posts?postId=${roomId}`);
        const data = await res.json();
        if (data.success) {
          setIsSaved(data.isSaved);
        }
      } catch (error) {
        console.error("Failed to check saved status", error);
      } finally {
        setLoading(false);
      }
    };
    checkSaved();
  }, [roomId]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    
    const previousState = isSaved;
    setIsSaved(!isSaved);

    try {
      if (previousState) {
        // Unsave
        await fetch(`/api/v1/user/saved-posts?postId=${roomId}`, { method: "DELETE" });
      } else {
        // Save
        await fetch("/api/v1/user/saved-posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: roomId }),
        });
      }
    } catch (error) {
      console.error("Failed to toggle save", error);
      setIsSaved(previousState);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleSave}
      disabled={loading}
      className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
      aria-label={isSaved ? "Bỏ lưu" : "Lưu tin"}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-6 w-6 ${isSaved ? "fill-red-500 text-red-500" : "fill-none text-slate-700"}`}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12.1 20.3l-1.1-1C6 15 3 12.3 3 8.9 3 6.1 5.1 4 7.9 4c1.6 0 3.1.8 4.1 2.1C13 4.8 14.5 4 16.1 4 18.9 4 21 6.1 21 8.9c0 3.4-3 6.1-8 10.4l-.9 1z" />
      </svg>
    </button>
  );
}
