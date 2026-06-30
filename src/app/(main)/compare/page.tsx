"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  LuTrash2,
  LuStar,
  LuCheck,
  LuX,
  LuArrowLeft,
  LuExternalLink,
  LuCoins,
  LuRuler,
  LuPhone,
  LuHouse,
  LuChevronRight
} from "react-icons/lu";

// Interface corresponding to RoomDetailData
interface RoomData {
  id: string;
  title: string;
  slug: string;
  priceLabel: string;
  areaLabel: string;
  depositLabel: string;
  availableRoomsLabel: string;
  description: string;
  imageUrls: string[];
  address: string;
  city: string;
  electricityPriceLabel: string;
  waterPriceLabel: string;
  location: {
    districtLabel: string;
    mapLabel: string;
  };
  contact: {
    name: string;
    phone: string;
    avatarUrl: string;
    responseTime: string;
  };
  propertyType: "nha_o" | "can_ho_chung_cu" | "phong_tro";
  details?: any;
  amenities: string[];
}

export default function ComparePage() {
  const router = useRouter();
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState(true);

  // Load IDs from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("compareRooms");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const ids = parsed.map((r: any) => r.id).filter(Boolean);
        setComparedIds(ids);
      } catch (err) {
        console.error("Error parsing compareRooms from localStorage", err);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch full details of compared rooms when IDs change
  useEffect(() => {
    if (comparedIds.length === 0) {
      setRooms([]);
      setLoading(false);
      return;
    }

    const fetchComparedRooms = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/rooms/compare?ids=${comparedIds.join(",")}`);
        const result = await res.json();
        if (result.success && result.data) {
          setRooms(result.data);
        } else {
          toast.error("Không thể tải thông tin so sánh phòng");
        }
      } catch (error) {
        console.error("Failed to fetch compared rooms", error);
        toast.error("Lỗi kết nối máy chủ");
      } finally {
        setLoading(false);
      }
    };

    fetchComparedRooms();
  }, [comparedIds]);

  // Remove a room from comparison list
  const handleRemoveRoom = (idToRemove: string) => {
    const updatedIds = comparedIds.filter(id => id !== idToRemove);
    setComparedIds(updatedIds);

    // Update localStorage
    const stored = localStorage.getItem("compareRooms");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const filtered = parsed.filter((r: any) => r.id !== idToRemove);
        localStorage.setItem("compareRooms", JSON.stringify(filtered));
        // Dispatch event for other listeners
        window.dispatchEvent(new Event("compareRoomsUpdated"));
      } catch (err) {
        console.error("Error updating compareRooms localStorage", err);
      }
    }
    toast.info("Đã xóa phòng khỏi danh sách so sánh");
  };

  // Helper function to check if a room has a specific amenity
  const hasAmenity = (room: RoomData, slug: string) => {
    const details = room.details || {};
    
    // Check direct boolean fields first
    if (slug === "wifi" && details.wifi) return true;
    if (slug === "air-conditioner" && (details.hasAirConditioner || details.airConditioner)) return true;
    if (slug === "fridge" && (details.hasFridge || details.fridge)) return true;
    if (slug === "washing-machine" && (details.hasWashingMachine || details.washingMachine)) return true;
    if (slug === "parking" && (details.hasParking || details.parking)) return true;
    if (slug === "loft" && (details.hasLoft || details.loft)) return true;
    if (slug === "private-wc" && (details.hasPrivateWc || details.hasPrivateWC || details.privateWc)) return true;
    if (slug === "pets" && (room.details?.allowPets !== undefined ? room.details.allowPets : details.allowPets)) return true;

    // Fallback to text matching in amenities array
    const amenitiesList = room.amenities || [];
    const keywordMap: Record<string, string[]> = {
      wifi: ["wifi", "internet", "mạng"],
      "air-conditioner": ["dieu hoa", "điều hòa", "máy lạnh", "may lanh"],
      fridge: ["tu lanh", "tủ lạnh"],
      "washing-machine": ["may giat", "máy giặt"],
      parking: ["xe", "giu xe", "để xe", "bãi xe"],
      loft: ["gac", "gác", "lửng"],
      "private-wc": ["wc rieng", "wc riêng", "khép kín", "khep kin"],
      pets: ["thu cung", "thú cưng", "cho nuoi", "chó", "mèo"],
    };

    const keywords = keywordMap[slug] || [];
    return amenitiesList.some((amenity: string) => {
      const lower = amenity.toLowerCase();
      return keywords.some(kw => lower.includes(kw));
    });
  };

  // Render checkmark icon or cross icon
  const renderAmenityStatus = (room: RoomData, slug: string) => {
    const active = hasAmenity(room, slug);
    return (
      <div className="flex items-center justify-center">
        {active ? (
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100">
            <LuCheck size={16} />
          </span>
        ) : (
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 text-rose-500 shadow-sm border border-rose-100">
            <LuX size={16} />
          </span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <main className="flex-1 bg-[#f5f7f9] py-20 flex flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0b7ea9] border-t-transparent" />
        <p className="mt-4 text-sm font-semibold text-slate-500">Đang phân tích và so sánh phòng trọ...</p>
      </main>
    );
  }

  if (rooms.length === 0) {
    return (
      <main className="flex-1 bg-[#f5f7f9] py-16 px-4">
        <div className="mx-auto max-w-xl text-center rounded-[32px] border border-white/70 bg-white p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)] md:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-6">
            <LuHouse size={36} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight mb-3">
            Danh sách so sánh trống
          </h1>
          <p className="text-sm leading-relaxed text-slate-500 mb-8 max-w-md mx-auto">
            Bạn chưa chọn phòng trọ nào để so sánh. Hãy quay lại trang tìm kiếm hoặc trang chi tiết phòng trọ và nhấn nút **So sánh** nhé!
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0b7ea9] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0a7198] shadow-md hover:shadow-lg"
          >
            Quay lại Tìm kiếm
            <LuChevronRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-[#f5f7f9] pb-20 pt-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="mb-5 text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-[#0b7ea9] transition">Trang chủ</Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/search" className="hover:text-[#0b7ea9] transition">Tìm kiếm</Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <span className="text-slate-700 font-medium">So sánh phòng</span>
            </li>
          </ol>
        </nav>

        {/* Title */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 sm:text-3xl tracking-tight leading-none">
              So sánh Phòng trọ
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              So sánh song song các đặc điểm phòng trọ giúp bạn đưa ra lựa chọn tối ưu nhất.
            </p>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-xs transition"
          >
            <LuArrowLeft size={14} /> Thêm phòng trọ khác
          </Link>
        </div>

        {/* Comparison Table Container */}
        <div className="overflow-x-auto rounded-[28px] border border-white/70 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <table className="w-full min-w-[700px] table-fixed border-collapse text-left text-sm text-slate-600 font-sans">
            
            {/* Headers row (Images & Actions) */}
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-6 font-bold text-slate-400 uppercase tracking-wider w-1/4">
                  Thuộc tính
                </th>
                {rooms.map((room) => (
                  <th key={room.id} className="p-6 relative w-1/4 border-l border-slate-100 align-top">
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveRoom(room.id)}
                      className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm border border-slate-200 hover:text-red-500 hover:border-red-200 transition cursor-pointer"
                      title="Xóa khỏi so sánh"
                    >
                      <LuX size={16} />
                    </button>
                    
                    {/* Post Card */}
                    <div className="space-y-4 pt-4 pr-4">
                      <div
                        className="h-32 w-full rounded-2xl bg-cover bg-center border border-slate-200"
                        style={{ backgroundImage: `url(${room.imageUrls[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80"})` }}
                      />
                      <div>
                        <span className="inline-block rounded-full bg-[#e8fbfc] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0b7ea9]">
                          {room.propertyType === "can_ho_chung_cu" ? "Căn hộ" : room.propertyType === "nha_o" ? "Nhà ở" : "Phòng trọ"}
                        </span>
                        <h3 className="mt-2 text-sm font-bold text-slate-800 leading-snug line-clamp-2 h-10" title={room.title}>
                          {room.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-400 truncate">{room.address}</p>
                      </div>
                      <Link
                        href={`/phong-tro/${room.slug}`}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#0b7ea9] py-2.5 text-xs font-bold text-white hover:bg-[#0a7198] transition shadow-xs"
                      >
                        Xem chi tiết
                        <LuExternalLink size={12} />
                      </Link>
                    </div>
                  </th>
                ))}
                {/* Pad columns to match 3 columns layout */}
                {[...Array(Math.max(0, 3 - rooms.length))].map((_, idx) => (
                  <th key={`pad-header-${idx}`} className="p-6 border-l border-slate-100 w-1/4 align-middle text-center text-slate-300 font-medium">
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl py-12 px-4">
                      Trống
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              
              {/* SECTION: THÔNG TIN CƠ BẢN */}
              <tr className="bg-slate-50/30">
                <td colSpan={4} className="px-6 py-3 font-bold text-[#0b5f89] uppercase tracking-wider text-xs border-b border-slate-100">
                  Thông tin cơ bản
                </td>
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                <td className="p-4 font-semibold text-slate-800">Giá thuê / tháng</td>
                {rooms.map(room => (
                  <td key={`price-${room.id}`} className="p-4 border-l border-slate-100 font-extrabold text-[#f2483a] text-base">
                    {room.priceLabel}
                  </td>
                ))}
                {[...Array(Math.max(0, 3 - rooms.length))].map((_, idx) => (
                  <td key={`price-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                ))}
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                <td className="p-4 font-semibold text-slate-800">Diện tích</td>
                {rooms.map(room => (
                  <td key={`area-${room.id}`} className="p-4 border-l border-slate-100 font-bold text-[#0b5f89]">
                    {room.areaLabel}
                  </td>
                ))}
                {[...Array(Math.max(0, 3 - rooms.length))].map((_, idx) => (
                  <td key={`area-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                ))}
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                <td className="p-4 font-semibold text-slate-800">Đặt cọc</td>
                {rooms.map(room => (
                  <td key={`dep-${room.id}`} className="p-4 border-l border-slate-100 font-medium text-slate-700">
                    {room.depositLabel || "Không có"}
                  </td>
                ))}
                {[...Array(Math.max(0, 3 - rooms.length))].map((_, idx) => (
                  <td key={`dep-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                ))}
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                <td className="p-4 font-semibold text-slate-800">Trạng thái phòng</td>
                {rooms.map(room => (
                  <td key={`status-${room.id}`} className="p-4 border-l border-slate-100 text-slate-600">
                    {room.availableRoomsLabel}
                  </td>
                ))}
                {[...Array(Math.max(0, 3 - rooms.length))].map((_, idx) => (
                  <td key={`status-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                ))}
              </tr>

              {/* SECTION: CHI PHÍ PHÁT SINH */}
              <tr className="bg-slate-50/30">
                <td colSpan={4} className="px-6 py-3 font-bold text-[#0b5f89] uppercase tracking-wider text-xs border-b border-slate-100">
                  Dịch vụ & Biểu giá
                </td>
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                <td className="p-4 font-semibold text-slate-800">Tiền điện</td>
                {rooms.map(room => (
                  <td key={`elec-${room.id}`} className="p-4 border-l border-slate-100 text-slate-700">
                    {room.electricityPriceLabel || "Theo đồng hồ nhà nước"}
                  </td>
                ))}
                {[...Array(Math.max(0, 3 - rooms.length))].map((_, idx) => (
                  <td key={`elec-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                ))}
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                <td className="p-4 font-semibold text-slate-800">Tiền nước</td>
                {rooms.map(room => (
                  <td key={`wat-${room.id}`} className="p-4 border-l border-slate-100 text-slate-700">
                    {room.waterPriceLabel || "Theo đồng hồ nhà nước"}
                  </td>
                ))}
                {[...Array(Math.max(0, 3 - rooms.length))].map((_, idx) => (
                  <td key={`wat-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                ))}
              </tr>

              {/* SECTION: TIỆN ÍCH PHÒNG TRỌ */}
              <tr className="bg-slate-50/30">
                <td colSpan={4} className="px-6 py-3 font-bold text-[#0b5f89] uppercase tracking-wider text-xs border-b border-slate-100">
                  Tiện ích đi kèm
                </td>
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                <td className="p-4 font-semibold text-slate-800">Internet / Wifi</td>
                {rooms.map(room => (
                  <td key={`wifi-${room.id}`} className="p-4 border-l border-slate-100">
                    {renderAmenityStatus(room, "wifi")}
                  </td>
                ))}
                {[...Array(Math.max(0, 3 - rooms.length))].map((_, idx) => (
                  <td key={`wifi-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                ))}
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                <td className="p-4 font-semibold text-slate-800">Máy lạnh / Điều hòa</td>
                {rooms.map(room => (
                  <td key={`ac-${room.id}`} className="p-4 border-l border-slate-100">
                    {renderAmenityStatus(room, "air-conditioner")}
                  </td>
                ))}
                {[...Array(Math.max(0, 3 - rooms.length))].map((_, idx) => (
                  <td key={`ac-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                ))}
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                <td className="p-4 font-semibold text-slate-800">Tủ lạnh</td>
                {rooms.map(room => (
                  <td key={`fridge-${room.id}`} className="p-4 border-l border-slate-100">
                    {renderAmenityStatus(room, "fridge")}
                  </td>
                ))}
                {[...Array(Math.max(0, 3 - rooms.length))].map((_, idx) => (
                  <td key={`fridge-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                ))}
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                <td className="p-4 font-semibold text-slate-800">Máy giặt</td>
                {rooms.map(room => (
                  <td key={`wm-${room.id}`} className="p-4 border-l border-slate-100">
                    {renderAmenityStatus(room, "washing-machine")}
                  </td>
                ))}
                {[...Array(Math.max(0, 3 - rooms.length))].map((_, idx) => (
                  <td key={`wm-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                ))}
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                <td className="p-4 font-semibold text-slate-800">Chỗ để xe</td>
                {rooms.map(room => (
                  <td key={`park-${room.id}`} className="p-4 border-l border-slate-100">
                    {renderAmenityStatus(room, "parking")}
                  </td>
                ))}
                {[...Array(Math.max(0, 3 - rooms.length))].map((_, idx) => (
                  <td key={`park-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                ))}
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                <td className="p-4 font-semibold text-slate-800">Gác lửng</td>
                {rooms.map(room => (
                  <td key={`loft-${room.id}`} className="p-4 border-l border-slate-100">
                    {renderAmenityStatus(room, "loft")}
                  </td>
                ))}
                {[...Array(Math.max(0, 3 - rooms.length))].map((_, idx) => (
                  <td key={`loft-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                ))}
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                <td className="p-4 font-semibold text-slate-800">Nhà vệ sinh riêng</td>
                {rooms.map(room => (
                  <td key={`wc-${room.id}`} className="p-4 border-l border-slate-100">
                    {renderAmenityStatus(room, "private-wc")}
                  </td>
                ))}
                {[...Array(Math.max(0, 3 - rooms.length))].map((_, idx) => (
                  <td key={`wc-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                ))}
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                <td className="p-4 font-semibold text-slate-800">Cho nuôi thú cưng</td>
                {rooms.map(room => (
                  <td key={`pet-${room.id}`} className="p-4 border-l border-slate-100">
                    {renderAmenityStatus(room, "pets")}
                  </td>
                ))}
                {[...Array(Math.max(0, 3 - rooms.length))].map((_, idx) => (
                  <td key={`pet-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                ))}
              </tr>

              {/* SECTION: QUY ĐỊNH & LIÊN HỆ */}
              <tr className="bg-slate-50/30">
                <td colSpan={4} className="px-6 py-3 font-bold text-[#0b5f89] uppercase tracking-wider text-xs border-b border-slate-100">
                  Quy định & Liên hệ
                </td>
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                <td className="p-4 font-semibold text-slate-800">Chung chủ / Giờ giấc</td>
                {rooms.map(room => {
                  const free = room.details?.curfewFree || room.details?.curfewFree === true;
                  return (
                    <td key={`curf-${room.id}`} className="p-4 border-l border-slate-100">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        free ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      }`}>
                        {free ? "Tự do (Không chung chủ)" : "Giới hạn / Chung chủ"}
                      </span>
                    </td>
                  );
                })}
                {[...Array(Math.max(0, 3 - rooms.length))].map((_, idx) => (
                  <td key={`curf-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                ))}
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                <td className="p-4 font-semibold text-slate-800">Người liên hệ</td>
                {rooms.map(room => (
                  <td key={`contact-${room.id}`} className="p-4 border-l border-slate-100 font-semibold text-slate-800">
                    {room.contact.name}
                  </td>
                ))}
                {[...Array(Math.max(0, 3 - rooms.length))].map((_, idx) => (
                  <td key={`contact-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                ))}
              </tr>
              <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                <td className="p-4 font-semibold text-slate-800">Số điện thoại</td>
                {rooms.map(room => (
                  <td key={`phone-${room.id}`} className="p-4 border-l border-slate-100">
                    <a
                      href={`tel:${room.contact.phone.replace(/\D/g, "")}`}
                      className="inline-flex items-center gap-1.5 text-[#0b7ea9] hover:underline font-bold"
                    >
                      <LuPhone size={14} />
                      {room.contact.phone}
                    </a>
                  </td>
                ))}
                {[...Array(Math.max(0, 3 - rooms.length))].map((_, idx) => (
                  <td key={`phone-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}
