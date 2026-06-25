"use client";

import React, { useState } from "react";
import { 
  LuGlobe, 
  LuWallet, 
  LuFileText, 
  LuSave 
} from "react-icons/lu";
import { IoCheckmarkCircle } from "react-icons/io5";

export default function SettingsPage() {
  // Tab hiện tại
  const [activeTab, setActiveTab] = useState("general");

  // State quản lý thông tin cài đặt
  const [siteSettings, setSiteSettings] = useState({
    siteName: "SyncRows - Nền tảng thuê phòng trọ",
    contactEmail: "admin@syncrows.com",
    contactPhone: "024.7300.1234",
    moderationPolicy: "Duyệt thủ công toàn bộ tin đăng",
    vipPricePerDay: "50000",
    minWithdraw: "100000",
    maxPostImages: "8",
    autoHideExpired: true
  });

  // State hiển thị thông báo lưu thành công
  const [showToast, setShowToast] = useState(false);

  // Hàm xử lý lưu
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowToast(true);
    // Tự động ẩn thông báo sau 3 giây
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl relative">
      
      {/* --- TOAST NOTIFICATION (Thông báo nổi) --- */}
      {showToast && (
        <div className="fixed top-24 right-8 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <IoCheckmarkCircle className="text-emerald-400" size={18} />
          <span>Cấu hình hệ thống đã được lưu thành công!</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Cài đặt hệ thống</h1>
        <p className="mt-1 text-sm text-slate-500">Cấu hình các tham số vận hành, dòng tiền và quy định của website.</p>
      </div>

      {/* --- THANH TABS NAVIGATION --- */}
      <div className="flex border-b border-slate-200 gap-1">
        <button 
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "general" 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <LuGlobe size={16} />
          Cấu hình chung
        </button>
        <button 
          onClick={() => setActiveTab("finance")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "finance" 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <LuWallet size={16} />
          Ví & Tài chính
        </button>
        <button 
          onClick={() => setActiveTab("policy")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "policy" 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <LuFileText size={16} />
          Quy định đăng tin
        </button>
      </div>

      {/* Form cấu hình chính */}
      <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        
        {/* ================= TAB 1: CẤU HÌNH CHUNG ================= */}
        {activeTab === "general" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên Website</label>
              <input 
                type="text" 
                value={siteSettings.siteName}
                onChange={(e) => setSiteSettings({...siteSettings, siteName: e.target.value})}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email liên hệ</label>
                <input 
                  type="email" 
                  value={siteSettings.contactEmail}
                  onChange={(e) => setSiteSettings({...siteSettings, contactEmail: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Hotline hỗ trợ</label>
                <input 
                  type="text" 
                  value={siteSettings.contactPhone}
                  onChange={(e) => setSiteSettings({...siteSettings, contactPhone: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: VÍ & TÀI CHÍNH ================= */}
        {activeTab === "finance" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Đơn giá gói VIP 1 (VNĐ/ngày)</label>
                <input 
                  type="number" 
                  value={siteSettings.vipPricePerDay}
                  onChange={(e) => setSiteSettings({...siteSettings, vipPricePerDay: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Số tiền rút tối thiểu khỏi ví (VNĐ)</label>
                <input 
                  type="number" 
                  value={siteSettings.minWithdraw}
                  onChange={(e) => setSiteSettings({...siteSettings, minWithdraw: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
                <p className="text-xs text-slate-400 mt-1">Dành cho chủ trọ khi muốn rút số dư ví ra tài khoản ngân hàng.</p>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: QUY ĐỊNH ĐĂNG TIN ================= */}
        {activeTab === "policy" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Chính sách kiểm duyệt tin mới</label>
              <select 
                value={siteSettings.moderationPolicy}
                onChange={(e) => setSiteSettings({...siteSettings, moderationPolicy: e.target.value})}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition cursor-pointer"
              >
                <option value="Duyệt thủ công toàn bộ tin đăng">Duyệt thủ công toàn bộ tin đăng (An toàn nhất)</option>
                <option value="Duyệt tự động (Sử dụng AI lọc từ khóa)">Duyệt tự động (Sử dụng AI lọc từ khóa vi phạm)</option>
                <option value="Duyệt tự động cho user VIP, thủ công cho user thường">Duyệt tự động cho chủ trọ VIP, thủ công cho tài khoản thường</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Số lượng hình ảnh tối đa / 1 tin đăng</label>
              <input 
                type="number" 
                value={siteSettings.maxPostImages}
                onChange={(e) => setSiteSettings({...siteSettings, maxPostImages: e.target.value})}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <input 
                type="checkbox" 
                id="autoHide"
                checked={siteSettings.autoHideExpired}
                onChange={(e) => setSiteSettings({...siteSettings, autoHideExpired: e.target.checked})}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="autoHide" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                Tự động ẩn tin đăng khi hết hạn gói hiển thị
              </label>
            </div>
          </div>
        )}

        {/* Nút lưu cuối form (Luôn cố định ở chân form) */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button 
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
          >
            <LuSave size={16} />
            Lưu cấu hình
          </button>
        </div>
      </form>
    </div>
  );
}