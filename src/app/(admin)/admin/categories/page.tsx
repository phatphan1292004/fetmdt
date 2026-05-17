"use client";

import React, { useState } from "react";
import { 
  LuFolder, 
  LuSquarePen, 
  LuTrash2, 
  LuCheck, 
  LuEyeOff,
  LuSparkles
} from "react-icons/lu";

// --- DỮ LIỆU MẪU: LOẠI HÌNH PHÒNG ---
const initialRoomCategories = [
  { id: 1, name: "Phòng trọ / Nhà trọ", count: 1250, status: "Hiển thị" },
  { id: 2, name: "Chung cư mini", count: 432, status: "Hiển thị" },
  { id: 3, name: "Nhà nguyên căn", count: 210, status: "Hiển thị" },
  { id: 4, name: "Ký túc xá / Sleepbox", count: 85, status: "Đã ẩn" },
];

// --- DỮ LIỆU MẪU: TIỆN ÍCH ---
const initialAmenities = [
  { id: 101, name: "Wifi / Internet tốc độ cao", status: "Hiển thị" },
  { id: 102, name: "Máy giặt chung", status: "Hiển thị" },
  { id: 103, name: "Điều hòa / Máy lạnh", status: "Hiển thị" },
  { id: 104, name: "Chỗ để xe an ninh", status: "Hiển thị" },
  { id: 105, name: "Thang máy", status: "Đã ẩn" },
];

export default function CategoriesPage() {
  const [roomCategories, setRoomCategories] = useState(initialRoomCategories);
  const [amenities, setAmenities] = useState(initialAmenities);

  // --- LOGIC XỬ LÝ LOẠI PHÒNG (ẨN / HIỆN) ---
  const handleToggleRoomStatus = (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "Hiển thị" ? "Đã ẩn" : "Hiển thị";
    const msg = currentStatus === "Hiển thị" 
      ? "Bạn có chắc chắn muốn ẩn loại hình này không? Các tin thuộc danh mục này sẽ tạm thời bị ảnh hưởng ngoài trang chủ." 
      : "Kích hoạt hiển thị lại danh mục này?";
    
    if (window.confirm(msg)) {
      setRoomCategories(roomCategories.map(cat => cat.id === id ? { ...cat, status: nextStatus } : cat));
    }
  };

  // --- LOGIC XỬ LÝ TIỆN ÍCH (ẨN / HIỆN) ---
  const handleToggleAmenityStatus = (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "Hiển thị" ? "Đã ẩn" : "Hiển thị";
    const msg = currentStatus === "Hiển thị" 
      ? "Bạn có chắc chắn muốn ẩn tiện ích này không?" 
      : "Kích hoạt hiển thị lại tiện ích này?";

    if (window.confirm(msg)) {
      setAmenities(amenities.map(am => am.id === id ? { ...am, status: nextStatus } : am));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Danh mục hệ thống</h1>
          <p className="mt-1 text-sm text-slate-500">Cấu hình các loại hình bất động sản và tiện ích đi kèm phòng trọ.</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm">
            + Thêm danh mục
          </button>
        </div>
      </div>

      {/* Grid 2 Cột bằng nhau */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ================= BẢNG 1: LOẠI HÌNH CHO THUÊ ================= */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-slate-200 bg-slate-50 p-4 font-bold text-slate-800 flex items-center gap-2">
            <LuFolder className="text-blue-600" size={18} />
            Loại hình bất động sản
          </div>
          <ul className="divide-y divide-slate-100 flex-1">
            {roomCategories.map((cat) => (
              <li key={cat.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-sm ${cat.status === "Đã ẩn" ? "text-slate-400 line-through" : "text-slate-800"}`}>
                      {cat.name}
                    </p>
                    {cat.status === "Đã ẩn" && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 whitespace-nowrap">Đang ẩn</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{cat.count} tin đăng liên kết</p>
                </div>
                
                {/* Khu vực thao tác - Cố định kích thước w-8 h-8 chống lệch */}
                <div className="flex items-center gap-1 shrink-0 ml-4">
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition" title="Sửa tên">
                    <LuSquarePen size={17} />
                  </button>
                  <button 
                    onClick={() => handleToggleRoomStatus(cat.id, cat.status)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                      cat.status === "Hiển thị" ? "text-slate-400 hover:bg-rose-50 hover:text-rose-600" : "text-emerald-600 hover:bg-emerald-50"
                    }`}
                    title={cat.status === "Hiển thị" ? "Ẩn danh mục" : "Hiển thị lại"}
                  >
                    {cat.status === "Hiển thị" ? <LuTrash2 size={17} /> : <LuCheck size={17} />}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* ================= BẢNG 2: TIỆN ÍCH PHÒNG TRỌ ================= */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-slate-200 bg-slate-50 p-4 font-bold text-slate-800 flex items-center gap-2">
            <LuSparkles className="text-amber-500" size={18} />
            Bộ lọc tiện ích phòng trọ
          </div>
          <ul className="divide-y divide-slate-100 flex-1">
            {amenities.map((am) => (
              <li key={am.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-sm ${am.status === "Đã ẩn" ? "text-slate-400 line-through" : "text-slate-800"}`}>
                      {am.name}
                    </p>
                    {am.status === "Đã ẩn" && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 whitespace-nowrap">Đang ẩn</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">ID thuộc tính: #{am.id}</p>
                </div>

                {/* Khu vực thao tác - Đồng bộ chuẩn kích thước */}
                <div className="flex items-center gap-1 shrink-0 ml-4">
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition" title="Sửa thuộc tính">
                    <LuSquarePen size={17} />
                  </button>
                  <button 
                    onClick={() => handleToggleAmenityStatus(am.id, am.status)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                      am.status === "Hiển thị" ? "text-slate-400 hover:bg-rose-50 hover:text-rose-600" : "text-emerald-600 hover:bg-emerald-50"
                    }`}
                    title={am.status === "Hiển thị" ? "Ẩn tiện ích" : "Hiển thị lại"}
                  >
                    {am.status === "Hiển thị" ? <LuTrash2 size={17} /> : <LuCheck size={17} />}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}