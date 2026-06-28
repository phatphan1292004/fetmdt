"use client";

import React, { useState, useEffect } from "react";
import {
  LuCheck,
  LuTrash2,
  LuStar,
  LuEye,
  LuX,
  LuChevronLeft,
  LuChevronRight,
  LuClock,
  LuCircleCheck
} from "react-icons/lu";

// --- 1. DỮ LIỆU MẪU ---
const initialReviews = [
  { id: "R01", user: "Hải Nam", post: "Phòng trọ Cầu Giấy", rating: 5, content: "Phòng rất sạch sẽ, chủ nhà nhiệt tình. Sẽ giới thiệu cho bạn bè.", date: "17/05/2026", status: "Đã duyệt" },
  { id: "R02", user: "Minh Tuấn", post: "Sleepbox Q10", rating: 2, content: "Hơi ồn ào vào ban đêm, cách âm kém, không giống ảnh trên mạng lắm.", date: "16/05/2026", status: "Chờ duyệt" },
  { id: "R03", user: "Lan Anh", post: "Chung cư mini Đống Đa", rating: 4, content: "Tiện ích đầy đủ, gần trạm xe buýt. Hơi đắt một chút nhưng đáng tiền.", date: "15/05/2026", status: "Đã duyệt" },
  { id: "R04", user: "Quốc Bảo", post: "Ký túc xá Bách Khoa", rating: 5, content: "Rẻ, tiện đi học. Anh quản lý thân thiện hay giúp đỡ sinh viên.", date: "14/05/2026", status: "Chờ duyệt" },
  { id: "R05", user: "Thu Thủy", post: "Nhà nguyên căn Tân Bình", rating: 1, content: "Chủ nhà hay khó khăn chuyện giờ giấc, nước bị yếu vào buổi tối.", date: "13/05/2026", status: "Chờ duyệt" },
  { id: "R06", user: "Hoàng Giang", post: "Căn hộ dịch vụ Quận 1", rating: 5, content: "Dịch vụ tuyệt vời, dọn phòng 2 lần/tuần rất sạch.", date: "12/05/2026", status: "Đã duyệt" },
  { id: "R07", user: "Mỹ Linh", post: "Phòng trọ Thủ Đức", rating: 3, content: "Phòng ổn nhưng hàng xóm hay hát karaoke cuối tuần.", date: "11/05/2026", status: "Đã duyệt" },
  { id: "R08", user: "Văn Phúc", post: "Nhà trọ sinh viên Q9", rating: 4, content: "Giá sinh viên, chỗ để xe rộng rãi thoải mái.", date: "10/05/2026", status: "Chờ duyệt" },
  { id: "R09", user: "Gia Hân", post: "Chung cư 2PN Bình Thạnh", rating: 5, content: "View landmark 81 cực đẹp, nội thất mới 100%.", date: "09/05/2026", status: "Đã duyệt" },
  { id: "R10", user: "Đức Trí", post: "Phòng trọ gác lửng Gò Vấp", rating: 2, content: "Gác hơi thấp, mùa hè bị hầm nóng. Tiền điện tính giá cao.", date: "08/05/2026", status: "Chờ duyệt" },
  { id: "R11", user: "Thảo Vy", post: "Sleepbox Q10", rating: 5, content: "Riêng tư, sạch sẽ, các bạn cùng phòng đều có ý thức tốt.", date: "07/05/2026", status: "Đã duyệt" },
  { id: "R12", user: "Khánh Thi", post: "Nhà nguyên căn Q7", rating: 4, content: "Nhà rộng, hẻm an ninh nhưng thỉnh thoảng ngập khi mưa lớn.", date: "06/05/2026", status: "Chờ duyệt" },
];

export default function ReviewManagementPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // States Modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);

  // Load reviews from DB
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/reviews");
      const result = await res.json();
      if (result.success && result.data) {
        const mapped = result.data.map((r: any) => ({
          id: r._id,
          user: r.userName,
          post: r.postTitle,
          rating: r.rating,
          content: r.content,
          date: new Date(r.createdAt).toLocaleDateString("vi-VN"),
          status: r.status === "approved" ? "Đã duyệt" : r.status === "pending" ? "Chờ duyệt" : "Đã ẩn",
        }));
        setReviews(mapped);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // --- LOGIC PHÂN TRANG ---
  const totalPages = Math.ceil(reviews.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentReviews = reviews.slice(startIndex, startIndex + itemsPerPage);

  // --- LOGIC DUYỆT / XÓA ---
  const handleApprove = async (id: string) => {
    try {
      const res = await fetch("/api/v1/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "approved" }),
      });
      const result = await res.json();
      if (result.success) {
        const updatedReviews = reviews.map(r =>
          r.id === id ? { ...r, status: "Đã duyệt" } : r
        );
        setReviews(updatedReviews);

        if (selectedReview && selectedReview.id === id) {
          setSelectedReview({ ...selectedReview, status: "Đã duyệt" });
        }
      }
    } catch (error) {
      console.error("Error approving review:", error);
    }
  };

  const handleHide = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn ẩn đánh giá này không? Đánh giá sẽ không hiển thị với người dùng.")) {
      try {
        const res = await fetch("/api/v1/admin/reviews", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status: "hidden" }),
        });
        const result = await res.json();
        if (result.success) {
          const updatedReviews = reviews.map(r =>
            r.id === id ? { ...r, status: "Đã ẩn" } : r
          );
          setReviews(updatedReviews);

          if (selectedReview && selectedReview.id === id) {
            setSelectedReview({ ...selectedReview, status: "Đã ẩn" });
          }
        }
      } catch (error) {
        console.error("Error hiding review:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Đánh giá</h1>
          <p className="mt-1 text-sm text-slate-500">Kiểm duyệt bình luận và đánh giá chất lượng phòng từ người thuê.</p>
        </div>
      </div>

      {/* Bảng Dữ Liệu */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold w-1/6">Người đánh giá</th>
                <th className="px-6 py-4 font-semibold w-1/5">Tin đăng</th>
                <th className="px-6 py-4 font-semibold">Đánh giá</th>
                <th className="px-6 py-4 font-semibold w-1/3">Nội dung</th>
                <th className="px-6 py-4 font-semibold text-center">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentReviews.length > 0 ? currentReviews.map((review) => (
                <tr key={review.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{review.user}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{review.date}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-blue-600 hover:underline cursor-pointer truncate max-w-[150px]" title={review.post}>
                    {review.post}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <LuStar key={i} size={14} className={i < review.rating ? "fill-amber-400" : "fill-slate-200 text-slate-200"} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="truncate max-w-[250px] text-slate-500" title={review.content}>
                      {review.content}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap ${review.status === "Đã duyệt" ? "bg-emerald-100 text-emerald-700" :
                      review.status === "Chờ duyệt" ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-600" /* Màu cho trạng thái Đã ẩn */
                      }`}>
                      {review.status === "Đã duyệt" ? <LuCircleCheck size={14} /> : <LuClock size={14} />}
                      {review.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* 1. Nút Xem chi tiết (Luôn luôn hiện) */}
                      <button
                        onClick={() => { setSelectedReview(review); setIsViewModalOpen(true); }}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition"
                        title="Xem chi tiết"
                      >
                        <LuEye size={18} />
                      </button>

                      {/* 2. Nút Duyệt (Chỉ hiện khi trạng thái là Chờ duyệt) */}
                      {review.status === "Chờ duyệt" ? (
                        <button
                          onClick={() => handleApprove(review.id)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-emerald-500 hover:bg-emerald-50 transition"
                          title="Duyệt đánh giá này"
                        >
                          <LuCheck size={18} />
                        </button>
                      ) : (
                        /* Khối giữ chỗ khi không có nút Duyệt */
                        <div className="h-8 w-8 shrink-0"></div>
                      )}

                      {/* 3. Nút Ẩn (Chỉ hiện khi trạng thái KHÔNG PHẢI là Đã ẩn) */}
                      {review.status !== "Đã ẩn" ? (
                        <button
                          onClick={() => handleHide(review.id)} // Gọi hàm ẩn ở đây
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 transition"
                          title="Ẩn đánh giá này"
                        >
                          <LuTrash2 size={18} />
                        </button>
                      ) : (
                        /* Khối giữ chỗ khi đánh giá đã bị ẩn rồi */
                        <div className="h-8 w-8 shrink-0"></div>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Không có đánh giá nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-white">
          <span className="text-sm text-slate-500">
            Đang xem <span className="font-medium text-slate-800">{reviews.length > 0 ? startIndex + 1 : 0}</span> đến <span className="font-medium text-slate-800">{Math.min(startIndex + itemsPerPage, reviews.length)}</span> trong tổng số <span className="font-medium text-slate-800">{reviews.length}</span> đánh giá
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition"
            >
              <LuChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-slate-700 px-2">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition"
            >
              <LuChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODAL: XEM CHI TIẾT (VIEW) ================= */}
      {isViewModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Chi tiết đánh giá</h3>
              <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition bg-white rounded-full p-1 shadow-sm">
                <LuX size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
                    {selectedReview.user.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{selectedReview.user}</h4>
                    <p className="text-xs text-slate-500">{selectedReview.date}</p>
                  </div>
                </div>
                <div className="flex items-center text-amber-400 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                  <span className="font-bold mr-1">{selectedReview.rating}.0</span>
                  <LuStar size={16} className="fill-amber-400" />
                </div>
              </div>

              <div className="mb-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Đánh giá cho phòng:</span>
                <span className="font-medium text-blue-600 cursor-pointer hover:underline inline-flex items-center gap-1">
                  {selectedReview.post}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-slate-700 leading-relaxed italic">
                  "{selectedReview.content}"
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between">
                {/* Đã cập nhật đủ 3 màu trạng thái và chống rớt dòng bằng whitespace-nowrap */}
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap ${selectedReview.status === "Đã duyệt" ? "bg-emerald-100 text-emerald-700" :
                    selectedReview.status === "Chờ duyệt" ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-600"
                  }`}>
                  Trạng thái: {selectedReview.status}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
              {/* Nút Ẩn đánh giá (Chỉ hiện khi chưa bị ẩn) */}
              {selectedReview.status !== "Đã ẩn" && (
                <button
                  onClick={() => handleHide(selectedReview.id)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
                >
                  Ẩn đánh giá
                </button>
              )}

              {/* Nút Duyệt đánh giá (Chỉ hiện khi đang Chờ duyệt) */}
              {selectedReview.status === "Chờ duyệt" && (
                <button
                  onClick={() => handleApprove(selectedReview.id)}
                  className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 transition shadow-sm flex items-center gap-2"
                >
                  <LuCheck size={16} /> Duyệt đánh giá
                </button>
              )}

              {/* Thêm nút Đóng đơn giản nếu trạng thái đã ẩn để modal không bị trống trải */}
              {selectedReview.status === "Đã ẩn" && (
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="rounded-xl bg-slate-200 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-300 transition"
                >
                  Đóng
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}