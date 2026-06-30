"use client";

import { useState } from "react";
import ReportModal from "@/src/components/ReportModal";
import { FaFlag } from "react-icons/fa";

export function ReportRoomButton({ roomId }: { roomId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitReport = async (data: { reason: string; description: string }) => {
    // Bước 6 sẽ thêm logic gọi API thực tế vào đây
    console.log("Submit report for room:", roomId, data);
    setIsModalOpen(false);
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
