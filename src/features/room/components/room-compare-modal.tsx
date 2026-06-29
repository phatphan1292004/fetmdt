"use client";

import { useEffect, useState } from "react";
import { GooglePlacesInput } from "@/src/components/GooglePlacesInput";
import type { RoomDetailData } from "../types";

// Haversine formula to calculate distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

const PROPERTY_TYPE_MAP: Record<string, string> = {
  "phong_tro": "Phòng trọ",
  "can_ho_chung_cu": "Căn hộ/Chung cư",
  "nha_o": "Nhà ở",
  "mat_bang": "Mặt bằng",
  "van_phong": "Văn phòng"
};

export function RoomCompareModal({
  rooms,
  onClose,
}: {
  rooms: RoomDetailData[];
  onClose: () => void;
}) {
  const [targetLocation, setTargetLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [targetInputText, setTargetInputText] = useState("");
  const [roomCoords, setRoomCoords] = useState<Record<string, { lat: number | null; lng: number | null }>>({});

  useEffect(() => {
    let isMounted = true;
    
    rooms.forEach((room) => {
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
            // Layer 2 fallback: strip specific house numbers and try again
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
  }, [rooms]);

  if (!rooms || rooms.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 sm:p-6">
          <h2 className="text-xl font-bold text-slate-900">So sánh phòng</h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Target location for distance comparison */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-3 font-semibold text-slate-800">So sánh khoảng cách</h3>
            <div className="max-w-md">
              <GooglePlacesInput
                label="Nhập địa điểm (trường học, công ty...)"
                placeholder="Ví dụ: Đại học Quốc gia Hà Nội"
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

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr>
                  <th className="w-48 border-b border-r border-slate-200 p-3 text-left font-semibold text-slate-500">Tiêu chí</th>
                  {rooms.map((room) => (
                    <th key={room.id} className="border-b border-slate-200 p-3 text-left align-top">
                      <div className="flex flex-col gap-2">
                        <div
                          className="h-32 w-full rounded-lg bg-cover bg-center"
                          style={{ backgroundImage: `url(${room.imageUrls[0]})` }}
                        />
                        <span className="line-clamp-2 text-sm font-bold text-[#0b5f89]">{room.title}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr>
                  <td className="border-b border-r border-slate-200 p-3 font-semibold text-slate-700">Giá</td>
                  {rooms.map((room) => (
                    <td key={room.id} className="border-b border-slate-200 p-3 font-bold text-red-500">{room.priceLabel}</td>
                  ))}
                </tr>
                <tr>
                  <td className="border-b border-r border-slate-200 p-3 font-semibold text-slate-700">Diện tích</td>
                  {rooms.map((room) => (
                    <td key={room.id} className="border-b border-slate-200 p-3 font-semibold text-[#0b7ea9]">{room.areaLabel}</td>
                  ))}
                </tr>
                <tr>
                  <td className="border-b border-r border-slate-200 p-3 font-semibold text-slate-700">Loại phòng</td>
                  {rooms.map((room) => (
                    <td key={room.id} className="border-b border-slate-200 p-3 text-slate-700">
                      {PROPERTY_TYPE_MAP[room.propertyType] || room.propertyType || "Phòng trọ"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border-b border-r border-slate-200 p-3 font-semibold text-slate-700">Khoảng cách</td>
                  {rooms.map((room) => {
                    if (!targetLocation) return <td key={room.id} className="border-b border-slate-200 p-3 text-slate-400">Chưa chọn điểm đến</td>;
                    
                    const coords = roomCoords[room.id];
                    if (!coords) return <td key={room.id} className="border-b border-slate-200 p-3 text-slate-500 italic">Đang tìm vị trí...</td>;
                    if (coords.lat === null || coords.lng === null) return <td key={room.id} className="border-b border-slate-200 p-3 text-red-400">Không tìm thấy vị trí</td>;
                    
                    const dist = calculateDistance(targetLocation.lat, targetLocation.lng, coords.lat, coords.lng);
                    return (
                      <td key={room.id} className="border-b border-slate-200 p-3 font-bold text-emerald-600">
                        {dist.toFixed(2)} km
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="border-b border-r border-slate-200 p-3 font-semibold text-slate-700">Tiện ích</td>
                  {rooms.map((room) => (
                    <td key={room.id} className="border-b border-slate-200 p-3">
                      <ul className="list-inside list-disc text-slate-600">
                        {room.amenities.slice(0, 5).map((am: any, idx) => (
                          <li key={idx}>{typeof am === "string" ? am : am.name}</li>
                        ))}
                        {room.amenities.length > 5 && <li>...</li>}
                      </ul>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border-b border-r border-slate-200 p-3 font-semibold text-slate-700">Địa chỉ</td>
                  {rooms.map((room) => (
                    <td key={room.id} className="border-b border-slate-200 p-3 text-slate-600">
                      {room.address}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
