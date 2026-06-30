"use client";

import { useState } from "react";
import ReportModal from "@/src/components/ReportModal";
import { FaFlag } from "react-icons/fa";
import { toast } from "react-toastify";

export function ReportRoomButton({ roomId }: { roomId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitReport = async (data: { reason: string; description: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: roomId,
          reason: data.reason,
          description: data.description,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Đã gửi báo cáo thành công. Cảm ơn bạn!");
        setIsModalOpen(false);
      } else {
        // Thông báo lỗi nếu người dùng chưa đăng nhập hoặc lỗi khác
        toast.error(result.message || "Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối. Vui lòng kiểm tra mạng.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-red-50 py-3 font-medium text-red-600 transition hover:bg-red-100"
      >
        <FaFlag />
        Báo cáo vi phạm
      </button>

      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitReport}
        isLoading={isLoading}
      />
    </>
  );
}
