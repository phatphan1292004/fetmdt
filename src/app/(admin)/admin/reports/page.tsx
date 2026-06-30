"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { LuCheck, LuX, LuTrash2, LuEye } from "react-icons/lu";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States quản lý Modal chi tiết
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Bước 10 sẽ thực hiện gọi API ở đây
  const fetchReports = async () => {
    setLoading(true);
    // TODO: implement fetch in step 10
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (reportId: string, status: string) => {
    // TODO: implement PATCH API in step 10
    console.log("Update status:", reportId, status);
  };

  const openDetailModal = (report: any) => {
    setSelectedReport(report);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Báo cáo vi phạm</h1>
          <p className="text-sm text-gray-500">Xem và xử lý các báo cáo từ người dùng</p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        {loading ? (
          <div className="py-10 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th className="px-4 py-3">Người báo cáo</th>
                  <th className="px-4 py-3">Bài viết</th>
                  <th className="px-4 py-3">Lý do</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center">Không có báo cáo nào</td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {report.userId?.fullName || "Người dùng ẩn danh"}
                      </td>
                      <td className="px-4 py-3">
                        <a href={`/phong-tro/${report.postId?.slug}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                          {report.postId?.title?.substring(0, 40)}...
                        </a>
                      </td>
                      <td className="px-4 py-3 font-medium text-red-600">
                        {report.reason}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                          report.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          report.status === "resolved" ? "bg-green-100 text-green-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openDetailModal(report)}
                            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                            title="Xem chi tiết"
                          >
                            <LuEye size={18} />
                          </button>
                          {report.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(report._id, "resolved")}
                                className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-green-100 hover:text-green-600"
                                title="Đánh dấu đã giải quyết"
                              >
                                <LuCheck size={18} />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(report._id, "rejected")}
                                className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-red-100 hover:text-red-600"
                                title="Từ chối báo cáo"
                              >
                                <LuX size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal chi tiết */}
      {isDetailModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl relative">
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <LuX size={24} />
            </button>
            <h2 className="mb-4 text-xl font-bold">Chi tiết báo cáo</h2>
            <div className="space-y-3 text-sm">
              <p><strong>Người báo cáo:</strong> {selectedReport.userId?.fullName}</p>
              <p><strong>Email:</strong> {selectedReport.userId?.email}</p>
              <p><strong>SĐT:</strong> {selectedReport.userId?.phone}</p>
              <div className="h-px w-full bg-gray-200 my-2"></div>
              <p><strong>Lý do vi phạm:</strong> <span className="text-red-600 font-medium">{selectedReport.reason}</span></p>
              <p><strong>Mô tả chi tiết:</strong></p>
              <div className="rounded border border-gray-200 bg-gray-50 p-3 min-h-[80px]">
                {selectedReport.description || "Không có mô tả chi tiết."}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="rounded-md border px-4 py-2 hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
