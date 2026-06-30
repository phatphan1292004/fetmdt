"use client";

import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

type ReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { reason: string; description: string }) => void;
  isLoading: boolean;
};

const REPORT_REASONS = [
  { value: "spam", label: "Tin rác / Spam" },
  { value: "fake", label: "Tin giả mạo / Lừa đảo" },
  { value: "wrong_price", label: "Sai giá / Sai thông tin" },
  { value: "scam", label: "Có dấu hiệu lừa tiền" },
  { value: "other", label: "Lý do khác" },
];

export default function ReportModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: ReportModalProps) {
  const [reason, setReason] = useState(REPORT_REASONS[0].value);
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ reason, description });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          disabled={isLoading}
        >
          <FaTimes size={20} />
        </button>

        <h2 className="mb-4 text-xl font-bold text-gray-800">Báo cáo tin đăng</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Lý do báo cáo
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isLoading}
            >
              {REPORT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Mô tả chi tiết (không bắt buộc)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập thêm thông tin để chúng tôi xử lý tốt hơn..."
              className="h-24 w-full resize-none rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isLoading}
              maxLength={500}
            />
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:bg-red-400 flex items-center justify-center min-w-[100px]"
              disabled={isLoading}
            >
              {isLoading ? "Đang gửi..." : "Gửi báo cáo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
