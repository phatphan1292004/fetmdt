"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { GooglePlacesInput } from "@/src/components/GooglePlacesInput";
import type { RoomDetailData } from "../types";
import { buildRoomRouteFromSlug } from "../servers";
import {
  LuCheck,
  LuX,
  LuExternalLink,
  LuPhone,
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
    latitude?: number;
    longitude?: number;
  };
  contact: {
    name: string;
    phone: string;
    avatarUrl: string;
    responseTime: string;
  };
  propertyType: "nha_o" | "can_ho_chung_cu" | "phong_tro";
  details?: any;
  amenities: any[];
}

// Haversine formula to calculate distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function RoomCompareModal({
  rooms: initialRooms,
  onClose,
}: {
  rooms: RoomDetailData[];
  onClose: () => void;
}) {
  const [targetLocation, setTargetLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [targetInputText, setTargetInputText] = useState("");
  const [roomCoords, setRoomCoords] = useState<Record<string, { lat: number | null; lng: number | null }>>({});
  const [fullRooms, setFullRooms] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch full details
  useEffect(() => {
    if (initialRooms.length === 0) {
      onClose();
      return;
    }

    const fetchComparedRooms = async () => {
      setLoading(true);
      try {
        const ids = initialRooms.map(r => r.id).join(",");
        const res = await fetch(`/api/v1/rooms/compare?ids=${ids}`);
        const result = await res.json();
        if (result.success && result.data) {
          setFullRooms(result.data);
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
  }, [initialRooms, onClose]);

  // Geocoding logic
  useEffect(() => {
    let isMounted = true;
    
    fullRooms.forEach((room) => {
      if (room.location?.latitude && room.location?.longitude) {
        setRoomCoords((prev) => ({
          ...prev,
          [room.id]: { lat: room.location.latitude!, lng: room.location.longitude! }
        }));
        return;
      }
      
      const geocode = async () => {
        try {
          const cleanCity = room.city.replace(/TPHCM|TP\.HCM|tp\.hcm/gi, "Hồ Chí Minh");
          let query = `${room.address}, ${cleanCity}`;
          
          let res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
            { headers: { "Accept-Language": "vi" } }
          );
          
          let data = await res.json();
          
          if (!data || data.length === 0) {
            const parts = room.address.split(",").map(p => p.trim());
            if (parts.length >= 2) {
              let street = parts[0];
              street = street.replace(/^\d+[\/\w]*\s+/, "").replace(/^(Số|Hẻm|Ngõ|Kiệt|Đường)\s+\d+[\/\w]*\s+/, "");
              const district = parts.length >= 3 ? parts[parts.length - 2] : parts[1];
              query = `${street}, ${district}, ${cleanCity}`;
              
              res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
                { headers: { "Accept-Language": "vi" } }
              );
              data = await res.json();
            }
          }
          
          if (isMounted) {
            if (data && data[0]) {
              setRoomCoords((prev) => ({
                ...prev,
                [room.id]: { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
              }));
            } else {
              setRoomCoords((prev) => ({
                ...prev,
                [room.id]: { lat: null, lng: null }
              }));
            }
          }
        } catch (e) {
          if (isMounted) {
            setRoomCoords((prev) => ({
              ...prev,
              [room.id]: { lat: null, lng: null }
            }));
          }
        }
      };
      
      setTimeout(geocode, 300 + Math.random() * 500);
    });

    return () => {
      isMounted = false;
    };
  }, [fullRooms]);

  const handleRemoveRoom = (idToRemove: string) => {
    const stored = localStorage.getItem("compareRooms");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const filtered = parsed.filter((r: any) => r.id !== idToRemove);
        localStorage.setItem("compareRooms", JSON.stringify(filtered));
        window.dispatchEvent(new Event("compareRoomsUpdated"));
      } catch (err) {
        console.error("Error updating compareRooms localStorage", err);
      }
    }
    toast.info("Đã xóa phòng khỏi danh sách so sánh");
  };

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
    return amenitiesList.some((amenity: any) => {
      const text = typeof amenity === "string" ? amenity : amenity.name;
      if (!text) return false;
      const lower = text.toLowerCase();
      return keywords.some(kw => lower.includes(kw));
    });
  };

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

  if (initialRooms.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[95vh] w-full max-w-7xl flex-col rounded-3xl bg-[#f5f7f9] shadow-2xl overflow-hidden border border-white/70">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white p-5 sm:px-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">So sánh Phòng trọ</h2>
            <p className="mt-1 text-xs text-slate-500">So sánh song song các đặc điểm phòng trọ giúp bạn đưa ra lựa chọn tối ưu nhất.</p>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition">
            <LuX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0b7ea9] border-t-transparent" />
              <p className="mt-4 text-sm font-semibold text-slate-500">Đang tải thông tin so sánh...</p>
            </div>
          ) : (
            <>
              {/* Target location for distance comparison */}
              <div className="mb-6 rounded-[24px] border border-white/70 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] max-w-2xl mx-auto">
                <h3 className="mb-3 font-semibold text-slate-800 text-sm">Khoảng cách đến địa điểm của bạn</h3>
                <div className="max-w-full">
                  <GooglePlacesInput
                    label=""
                    placeholder="Ví dụ: Đại học Quốc gia Hà Nội, công ty..."
                    value={targetInputText}
                    onValueChange={setTargetInputText}
                    onPlaceSelected={(place) => {
                      if (place?.lat && place?.lng) {
                        setTargetLocation({ lat: place.lat, lng: place.lng, address: place.address });
                        setTargetInputText(place.address);
                      } else {
                        setTargetLocation(null);
                      }
                    }}
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-[28px] border border-white/70 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                <table className="w-full min-w-[700px] table-fixed border-collapse text-left text-sm text-slate-600 font-sans">
                  {/* Headers row (Images & Actions) */}
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="p-6 font-bold text-slate-400 uppercase tracking-wider w-1/4">
                        Thuộc tính
                      </th>
                      {fullRooms.map((room) => (
                        <th key={room.id} className="p-6 relative w-1/4 border-l border-slate-100 align-top">
                          <button
                            onClick={() => handleRemoveRoom(room.id)}
                            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm border border-slate-200 hover:text-red-500 hover:border-red-200 transition cursor-pointer"
                            title="Xóa khỏi so sánh"
                          >
                            <LuX size={16} />
                          </button>
                          
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
                              href={buildRoomRouteFromSlug(room.slug)}
                              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#0b7ea9] py-2.5 text-xs font-bold text-white hover:bg-[#0a7198] transition shadow-xs"
                            >
                              Xem chi tiết
                              <LuExternalLink size={12} />
                            </Link>
                          </div>
                        </th>
                      ))}
                      {[...Array(Math.max(0, 3 - fullRooms.length))].map((_, idx) => (
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
                      {fullRooms.map(room => (
                        <td key={`price-${room.id}`} className="p-4 border-l border-slate-100 font-extrabold text-[#f2483a] text-base">
                          {room.priceLabel}
                        </td>
                      ))}
                      {[...Array(Math.max(0, 3 - fullRooms.length))].map((_, idx) => (
                        <td key={`price-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                      <td className="p-4 font-semibold text-slate-800">Diện tích</td>
                      {fullRooms.map(room => (
                        <td key={`area-${room.id}`} className="p-4 border-l border-slate-100 font-bold text-[#0b5f89]">
                          {room.areaLabel}
                        </td>
                      ))}
                      {[...Array(Math.max(0, 3 - fullRooms.length))].map((_, idx) => (
                        <td key={`area-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                      <td className="p-4 font-semibold text-slate-800">Đặt cọc</td>
                      {fullRooms.map(room => (
                        <td key={`dep-${room.id}`} className="p-4 border-l border-slate-100 font-medium text-slate-700">
                          {room.depositLabel || "Không có"}
                        </td>
                      ))}
                      {[...Array(Math.max(0, 3 - fullRooms.length))].map((_, idx) => (
                        <td key={`dep-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                      <td className="p-4 font-semibold text-slate-800">Trạng thái phòng</td>
                      {fullRooms.map(room => (
                        <td key={`status-${room.id}`} className="p-4 border-l border-slate-100 text-slate-600">
                          {room.availableRoomsLabel}
                        </td>
                      ))}
                      {[...Array(Math.max(0, 3 - fullRooms.length))].map((_, idx) => (
                        <td key={`status-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                      <td className="p-4 font-semibold text-slate-800">Khoảng cách</td>
                      {fullRooms.map((room) => {
                        if (!targetLocation) return <td key={`dist-${room.id}`} className="p-4 border-l border-slate-100 text-slate-400">Chưa chọn điểm đến</td>;
                        
                        const coords = roomCoords[room.id];
                        if (!coords) return <td key={`dist-${room.id}`} className="p-4 border-l border-slate-100 text-slate-500 italic">Đang tìm vị trí...</td>;
                        if (coords.lat === null || coords.lng === null) return <td key={`dist-${room.id}`} className="p-4 border-l border-slate-100 text-red-400">Không tìm thấy vị trí</td>;
                        
                        const dist = calculateDistance(targetLocation.lat, targetLocation.lng, coords.lat, coords.lng);
                        return (
                          <td key={`dist-${room.id}`} className="p-4 border-l border-slate-100 font-bold text-emerald-600">
                            {dist.toFixed(2)} km
                          </td>
                        );
                      })}
                      {[...Array(Math.max(0, 3 - fullRooms.length))].map((_, idx) => (
                        <td key={`dist-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
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
                      {fullRooms.map(room => (
                        <td key={`elec-${room.id}`} className="p-4 border-l border-slate-100 text-slate-700">
                          {room.electricityPriceLabel || "Theo đồng hồ nhà nước"}
                        </td>
                      ))}
                      {[...Array(Math.max(0, 3 - fullRooms.length))].map((_, idx) => (
                        <td key={`elec-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                      <td className="p-4 font-semibold text-slate-800">Tiền nước</td>
                      {fullRooms.map(room => (
                        <td key={`wat-${room.id}`} className="p-4 border-l border-slate-100 text-slate-700">
                          {room.waterPriceLabel || "Theo đồng hồ nhà nước"}
                        </td>
                      ))}
                      {[...Array(Math.max(0, 3 - fullRooms.length))].map((_, idx) => (
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
                      {fullRooms.map(room => (
                        <td key={`wifi-${room.id}`} className="p-4 border-l border-slate-100">
                          {renderAmenityStatus(room, "wifi")}
                        </td>
                      ))}
                      {[...Array(Math.max(0, 3 - fullRooms.length))].map((_, idx) => (
                        <td key={`wifi-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                      <td className="p-4 font-semibold text-slate-800">Máy lạnh / Điều hòa</td>
                      {fullRooms.map(room => (
                        <td key={`ac-${room.id}`} className="p-4 border-l border-slate-100">
                          {renderAmenityStatus(room, "air-conditioner")}
                        </td>
                      ))}
                      {[...Array(Math.max(0, 3 - fullRooms.length))].map((_, idx) => (
                        <td key={`ac-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                      <td className="p-4 font-semibold text-slate-800">Tủ lạnh</td>
                      {fullRooms.map(room => (
                        <td key={`fridge-${room.id}`} className="p-4 border-l border-slate-100">
                          {renderAmenityStatus(room, "fridge")}
                        </td>
                      ))}
                      {[...Array(Math.max(0, 3 - fullRooms.length))].map((_, idx) => (
                        <td key={`fridge-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                      <td className="p-4 font-semibold text-slate-800">Máy giặt</td>
                      {fullRooms.map(room => (
                        <td key={`wm-${room.id}`} className="p-4 border-l border-slate-100">
                          {renderAmenityStatus(room, "washing-machine")}
                        </td>
                      ))}
                      {[...Array(Math.max(0, 3 - fullRooms.length))].map((_, idx) => (
                        <td key={`wm-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                      <td className="p-4 font-semibold text-slate-800">Chỗ để xe</td>
                      {fullRooms.map(room => (
                        <td key={`park-${room.id}`} className="p-4 border-l border-slate-100">
                          {renderAmenityStatus(room, "parking")}
                        </td>
                      ))}
                      {[...Array(Math.max(0, 3 - fullRooms.length))].map((_, idx) => (
                        <td key={`park-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                      <td className="p-4 font-semibold text-slate-800">Gác lửng</td>
                      {fullRooms.map(room => (
                        <td key={`loft-${room.id}`} className="p-4 border-l border-slate-100">
                          {renderAmenityStatus(room, "loft")}
                        </td>
                      ))}
                      {[...Array(Math.max(0, 3 - fullRooms.length))].map((_, idx) => (
                        <td key={`loft-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                      <td className="p-4 font-semibold text-slate-800">Nhà vệ sinh riêng</td>
                      {fullRooms.map(room => (
                        <td key={`wc-${room.id}`} className="p-4 border-l border-slate-100">
                          {renderAmenityStatus(room, "private-wc")}
                        </td>
                      ))}
                      {[...Array(Math.max(0, 3 - fullRooms.length))].map((_, idx) => (
                        <td key={`wc-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                      <td className="p-4 font-semibold text-slate-800">Cho nuôi thú cưng</td>
                      {fullRooms.map(room => (
                        <td key={`pet-${room.id}`} className="p-4 border-l border-slate-100">
                          {renderAmenityStatus(room, "pets")}
                        </td>
                      ))}
                      {[...Array(Math.max(0, 3 - fullRooms.length))].map((_, idx) => (
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
                      {fullRooms.map(room => {
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
                      {[...Array(Math.max(0, 3 - fullRooms.length))].map((_, idx) => (
                        <td key={`curf-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                      <td className="p-4 font-semibold text-slate-800">Người liên hệ</td>
                      {fullRooms.map(room => (
                        <td key={`contact-${room.id}`} className="p-4 border-l border-slate-100 font-semibold text-slate-800">
                          {room.contact?.name || "Không rõ"}
                        </td>
                      ))}
                      {[...Array(Math.max(0, 3 - fullRooms.length))].map((_, idx) => (
                        <td key={`contact-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition">
                      <td className="p-4 font-semibold text-slate-800">Số điện thoại</td>
                      {fullRooms.map(room => (
                        <td key={`phone-${room.id}`} className="p-4 border-l border-slate-100">
                          {room.contact?.phone ? (
                            <a
                              href={`tel:${room.contact.phone.replace(/\D/g, "")}`}
                              className="inline-flex items-center gap-1.5 text-[#0b7ea9] hover:underline font-bold"
                            >
                              <LuPhone size={14} />
                              {room.contact.phone}
                            </a>
                          ) : (
                            <span className="text-slate-400">Không có</span>
                          )}
                        </td>
                      ))}
                      {[...Array(Math.max(0, 3 - fullRooms.length))].map((_, idx) => (
                        <td key={`phone-pad-${idx}`} className="p-4 border-l border-slate-100 text-slate-300">—</td>
                      ))}
                    </tr>

                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
