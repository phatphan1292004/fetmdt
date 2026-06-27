"use client";

import React, { useState, useEffect } from "react";
import { 
  LuEye, 
  LuSquarePen, 
  LuTrash2, 
  LuX, 
  LuChevronLeft, 
  LuChevronRight,
  LuPlus,
  LuSparkles
} from "react-icons/lu";
import { toast } from "react-toastify";

const COLOR_OPTIONS = [
  { label: "Vàng Cam (VIP 1)", value: "from-amber-500 to-orange-600", text: "text-amber-600" },
  { label: "Lục Bảo (VIP 2)", value: "from-emerald-500 to-teal-600", text: "text-emerald-600" },
  { label: "Xanh Dương (VIP 3)", value: "from-blue-500 to-indigo-600", text: "text-blue-600" },
  { label: "Tím Thủy Tiên", value: "from-fuchsia-500 to-purple-600", text: "text-purple-600" },
  { label: "Hồng Ruby", value: "from-pink-500 to-rose-600", text: "text-rose-600" }
];

export default function PackagesManagementPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States quản lý Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<any>(null);

  // Form states for adding package
  const [newPkg, setNewPkg] = useState({
    code: "",
    name: "",
    price: "",
    description: "",
    featuresText: "", // newline-separated
    isPopular: false,
    colorIndex: 2 // default to Blue
  });

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/packages");
      const data = await res.json();
      if (res.ok && data.success) {
        setPackages(data.data || []);
      } else {
        toast.error(data.message || "Không thể tải danh sách gói tin");
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error("Đã xảy ra lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // --- LOGIC THÊM MỚI (ADD) ---
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeColor = COLOR_OPTIONS[newPkg.colorIndex];
    const payload = {
      code: newPkg.code,
      name: newPkg.name,
      price: Number(newPkg.price),
      description: newPkg.description,
      features: newPkg.featuresText.split("\n").map(f => f.trim()).filter(Boolean),
      isPopular: newPkg.isPopular,
      color: activeColor.value,
      textColor: activeColor.text
    };

    try {
      const res = await fetch("/api/v1/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Thêm gói tin mới thành công!");
        setIsAddModalOpen(false);
        fetchPackages();
      } else {
        toast.error(data.message || "Thêm gói tin thất bại");
      }
    } catch (error) {
      console.error("Error creating package:", error);
      toast.error("Thêm gói tin thất bại");
    }
  };

  // --- LOGIC CHỈNH SỬA (EDIT) ---
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeColor = COLOR_OPTIONS[selectedPkg.colorIndex];
    const payload = {
      name: selectedPkg.name,
      price: Number(selectedPkg.price),
      description: selectedPkg.description,
      features: selectedPkg.featuresText.split("\n").map((f: string) => f.trim()).filter(Boolean),
      isPopular: selectedPkg.isPopular,
      color: activeColor.value,
      textColor: activeColor.text
    };

    try {
      const res = await fetch(`/api/v1/packages?id=${selectedPkg._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Cập nhật gói tin thành công!");
        setIsEditModalOpen(false);
        fetchPackages();
      } else {
        toast.error(data.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Error updating package:", error);
      toast.error("Cập nhật thất bại");
    }
  };

  // --- LOGIC XÓA (DELETE) ---
  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn XÓA VĨNH VIỄN gói tin này? Tin đăng đang sử dụng gói này có thể bị ảnh hưởng.")) {
      try {
        const res = await fetch(`/api/v1/packages?id=${id}`, {
          method: "DELETE"
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast.success("Xóa gói tin thành công!");
          setPackages(prev => prev.filter(p => p._id !== id));
        } else {
          toast.error(data.message || "Xóa thất bại");
        }
      } catch (error) {
        console.error("Error deleting package:", error);
        toast.error("Xóa thất bại");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Gói dịch vụ</h1>
          <p className="mt-1 text-sm text-slate-500">Cấu hình các gói dịch vụ đẩy tin VIP hiển thị trên ứng dụng.</p>
        </div>
        <button 
          onClick={() => {
            setNewPkg({
              code: "",
              name: "",
              price: "",
              description: "",
              featuresText: "",
              isPopular: false,
              colorIndex: 2
            });
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition cursor-pointer"
        >
          <LuPlus size={16} />
          Thêm gói dịch vụ mới
        </button>
      </div>

      {/* Bảng Dữ Liệu */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-[300px]">
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center py-20 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="mt-3 text-sm font-medium">Đang tải danh sách các gói dịch vụ...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-20 text-slate-400">
            <p className="text-sm font-medium">Không có dữ liệu gói dịch vụ nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Mã gói</th>
                  <th className="px-6 py-4 font-semibold">Tên gói</th>
                  <th className="px-6 py-4 font-semibold">Giá ngày</th>
                  <th className="px-6 py-4 font-semibold">Tính năng nổi bật</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái nổi bật</th>
                  <th className="px-6 py-4 font-semibold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {packages.map((pkg) => (
                  <tr key={pkg._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {pkg.code.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block h-3.5 w-3.5 rounded-full bg-gradient-to-r ${pkg.color}`} />
                        {pkg.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      {pkg.price.toLocaleString("vi-VN")}đ/ngày
                    </td>
                    <td className="px-6 py-4 truncate max-w-[200px]" title={pkg.description}>
                      {pkg.description}
                    </td>
                    <td className="px-6 py-4">
                      {pkg.isPopular ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                          <LuSparkles size={12} />
                          Khuyên dùng
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Bình thường</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => { 
                            setSelectedPkg(pkg); 
                            setIsViewModalOpen(true); 
                          }}
                          className="text-slate-400 hover:text-blue-600 transition cursor-pointer" title="Xem chi tiết"
                        >
                          <LuEye size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            // Find color index
                            const colorIndex = COLOR_OPTIONS.findIndex(o => o.value === pkg.color) === -1 
                              ? 2 
                              : COLOR_OPTIONS.findIndex(o => o.value === pkg.color);
                            setSelectedPkg({
                              ...pkg,
                              colorIndex,
                              featuresText: pkg.features.join("\n")
                            });
                            setIsEditModalOpen(true);
                          }}
                          className="text-slate-400 hover:text-emerald-600 transition cursor-pointer" title="Chỉnh sửa"
                        >
                          <LuSquarePen size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(pkg._id)}
                          className="text-slate-400 hover:text-rose-600 transition cursor-pointer" title="Xóa"
                        >
                          <LuTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODAL: THÊM MỚI GÓI TIN ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between border-b border-slate-100 px-6 py-4 z-10">
              <h3 className="text-lg font-bold text-slate-800">Thêm gói dịch vụ mới</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
                <LuX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mã gói (Vd: vip1, vip2...)</label>
                  <input 
                    type="text" required
                    value={newPkg.code}
                    onChange={(e) => setNewPkg({...newPkg, code: e.target.value})}
                    placeholder="Mã định danh"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên gói dịch vụ</label>
                  <input 
                    type="text" required
                    value={newPkg.name}
                    onChange={(e) => setNewPkg({...newPkg, name: e.target.value})}
                    placeholder="Vd: VIP 1 (Siêu Cấp)"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giá mỗi ngày (VNĐ)</label>
                  <input 
                    type="number" required
                    value={newPkg.price}
                    onChange={(e) => setNewPkg({...newPkg, price: e.target.value})}
                    placeholder="Vd: 50000"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giao diện màu hiển thị</label>
                  <select 
                    value={newPkg.colorIndex}
                    onChange={(e) => setNewPkg({...newPkg, colorIndex: Number(e.target.value)})}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition cursor-pointer"
                  >
                    {COLOR_OPTIONS.map((opt, idx) => (
                      <option key={opt.value} value={idx}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả ngắn</label>
                <input 
                  type="text" required
                  value={newPkg.description}
                  onChange={(e) => setNewPkg({...newPkg, description: e.target.value})}
                  placeholder="Vd: Tiếp cận lượng khách hàng tối đa..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Các tính năng (Nhập mỗi dòng một tính năng)</label>
                <textarea 
                  rows={4} required
                  value={newPkg.featuresText}
                  onChange={(e) => setNewPkg({...newPkg, featuresText: e.target.value})}
                  placeholder="Vd:&#13;Ghim đầu trang tìm kiếm&#13;Thẻ nổi bật có Glow border&#13;Tự động đẩy tin mỗi 2 giờ"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition resize-none"
                />
              </div>

              <div className="flex items-center">
                <input 
                  id="add-is-popular"
                  type="checkbox"
                  checked={newPkg.isPopular}
                  onChange={(e) => setNewPkg({...newPkg, isPopular: e.target.checked})}
                  className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="add-is-popular" className="ml-2 text-sm font-medium text-slate-700 cursor-pointer">Gợi ý khuyên dùng (Highlight nổi bật)</label>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer">Hủy bỏ</button>
                <button type="submit" className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm cursor-pointer">Tạo gói tin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CHỈNH SỬA (EDIT) ================= */}
      {isEditModalOpen && selectedPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between border-b border-slate-100 px-6 py-4 z-10">
              <h3 className="text-lg font-bold text-slate-800">Chỉnh sửa gói dịch vụ <span className="text-blue-600">{selectedPkg.code.toUpperCase()}</span></h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
                <LuX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên gói dịch vụ</label>
                <input 
                  type="text" required
                  value={selectedPkg.name}
                  onChange={(e) => setSelectedPkg({...selectedPkg, name: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giá mỗi ngày (VNĐ)</label>
                  <input 
                    type="number" required
                    value={selectedPkg.price}
                    onChange={(e) => setSelectedPkg({...selectedPkg, price: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giao diện màu hiển thị</label>
                  <select 
                    value={selectedPkg.colorIndex}
                    onChange={(e) => setSelectedPkg({...selectedPkg, colorIndex: Number(e.target.value)})}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition cursor-pointer"
                  >
                    {COLOR_OPTIONS.map((opt, idx) => (
                      <option key={opt.value} value={idx}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả ngắn</label>
                <input 
                  type="text" required
                  value={selectedPkg.description}
                  onChange={(e) => setSelectedPkg({...selectedPkg, description: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Các tính năng (Nhập mỗi dòng một tính năng)</label>
                <textarea 
                  rows={4} required
                  value={selectedPkg.featuresText}
                  onChange={(e) => setSelectedPkg({...selectedPkg, featuresText: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 transition resize-none"
                />
              </div>

              <div className="flex items-center">
                <input 
                  id="edit-is-popular"
                  type="checkbox"
                  checked={selectedPkg.isPopular}
                  onChange={(e) => setSelectedPkg({...selectedPkg, isPopular: e.target.checked})}
                  className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="edit-is-popular" className="ml-2 text-sm font-medium text-slate-700 cursor-pointer">Gợi ý khuyên dùng (Highlight nổi bật)</label>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer">Hủy bỏ</button>
                <button type="submit" className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm cursor-pointer">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: XEM CHI TIẾT (VIEW) ================= */}
      {isViewModalOpen && selectedPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className={`relative h-24 bg-gradient-to-r ${selectedPkg.color}`}>
              <button onClick={() => setIsViewModalOpen(false)} className="absolute top-4 right-4 text-white hover:text-slate-200 transition bg-black/20 rounded-full p-1 cursor-pointer">
                <LuX size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mã gói: {selectedPkg.code.toUpperCase()}</span>
                <h2 className="text-xl font-bold text-slate-800 mt-1">{selectedPkg.name}</h2>
                <p className="text-[22px] font-black text-emerald-600 mt-2">{selectedPkg.price.toLocaleString("vi-VN")} VNĐ/ngày</p>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mô tả</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedPkg.description}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tính năng chi tiết</h4>
                  <ul className="space-y-1.5 text-sm text-slate-600">
                    {selectedPkg.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#10b981] font-bold mt-0.5">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
