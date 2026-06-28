"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AmenityData, AmenitySlug, RoomDetailData } from "../types";
import { buildRoomRouteFromSlug } from "../servers";
import { AMENITY_MAP } from "../constants/amenity-icons";
import { toast } from "react-toastify";

// Amenities Categories Icons
function GraduationCapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
  );
}

function BusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <rect x="4" y="3" width="16" height="16" rx="2" />
      <path d="M4 11h16" />
      <path d="M12 3v8" />
      <path d="m8 19-2 2" />
      <path d="m16 19 2 2" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="m3 9 2.44-4A2 2 0 0 1 7.18 4h9.64a2 2 0 0 1 1.74 1l2.44 4" />
      <path d="M12 9v12" />
      <path d="M9 14h6" />
    </svg>
  );
}

function SupermarketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <circle cx="8" cy="21" r="1" fill="currentColor" />
      <circle cx="19" cy="21" r="1" fill="currentColor" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

function CafeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </svg>
  );
}

function RestaurantIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v8c0 1.1.9 2 2 2h3Z" />
      <path d="M19 17v5" />
    </svg>
  );
}

function MedicalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  );
}

function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

const AMENITY_CATEGORIES = [
  { id: "university", label: "Đại học", icon: GraduationCapIcon, query: "trường đại học", osmTag: "[amenity=university]" },
  { id: "bus", label: "Bến xe buýt", icon: BusIcon, query: "bến xe buýt", osmTag: "[highway=bus_stop]" },
  { id: "popular", label: "Điểm nổi bật", icon: StarIcon, query: "địa điểm nổi tiếng", osmTag: '[amenity~"tourism|monument|attraction|park|museum"]' },
  { id: "convenience", label: "Cửa hàng tiện lợi", icon: StoreIcon, query: "Circle K, GS25, 7-Eleven", osmTag: '[shop=convenience][name~"Circle K|GS25|7-Eleven|7 Eleven|FamilyMart|Family Mart|Ministop|Mini Stop|B\'s Mart",i]' },
  { id: "supermarket", label: "Siêu thị", icon: SupermarketIcon, query: "WinMart, Co.op Mart", osmTag: '[shop~"supermarket|convenience"][name~"WinMart|Winsmart|Co.op|Coop|Bách Hóa Xanh|Bach Hoa Xanh|Lotte|Aeon|Big C|Go!",i]' },
  { id: "cafe", label: "Cafe", icon: CafeIcon, query: "quán cafe", osmTag: "[amenity=cafe]" },
  { id: "restaurant", label: "Nhà hàng", icon: RestaurantIcon, query: "nhà hàng", osmTag: "[amenity=restaurant]" },
  { id: "medical", label: "Y tế", icon: MedicalIcon, query: "bệnh viện phòng khám", osmTag: '[amenity~"hospital|clinic|pharmacy|doctors"]' },
] as const;

type RoomDetailPageProps = {
  room: RoomDetailData;
  relatedRooms: readonly RoomDetailData[];
};

function GalleryTile({ imageUrl, className }: { imageUrl: string; className?: string }) {
  return (
    <div
      className={`overflow-hidden bg-slate-200 bg-cover bg-center ${className ?? ""}`}
      style={{ backgroundImage: `url(${imageUrl})` }}
      aria-hidden
    />
  );
}

function DetailItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-[#fbfdfd] p-3.5 shadow-sm transition hover:shadow-md">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-[14px] font-semibold text-slate-700 leading-snug">{value}</p>
    </div>
  );
}

const iconClassName = "h-4 w-4 text-[#25c3c8]";

const AMENITY_LABEL_TO_SLUG: Readonly<Record<string, AmenitySlug>> = {
  "Noi that day du": "furnished",
  "May giat chung": "washing-machine",
  "May giat": "washing-machine",
  "Thang may": "elevator",
  "Khoa van tay": "fingerprint-lock",
  "Giu xe": "parking",
  "Internet toc do cao": "wifi",
  "Dieu hoa": "air-conditioner",
  "Binh nong lanh": "water-heater",
  "Bep rieng": "kitchen",
  Wifi: "wifi",
};

function AmenityIcon({ slug }: { slug: AmenitySlug }) {
  return (
    AMENITY_MAP[slug] ?? (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClassName}>
        <path d="M20 6L9 17l-5-5" />
      </svg>
    )
  );
}

function normalizeAmenity(amenity: AmenityData | string, index: number): AmenityData {
  if (typeof amenity !== "string") {
    return amenity;
  }

  return {
    id: `amenity-${index}`,
    name: amenity,
    slug: AMENITY_LABEL_TO_SLUG[amenity] ?? "security",
  };
}

export function RoomDetailPage({ room, relatedRooms }: RoomDetailPageProps) {
  const gallery = [...room.imageUrls];
  const contactPhoneHref = room.contact.phone.replace(/\D/g, "");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState<typeof AMENITY_CATEGORIES[number] | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    room.location.latitude && room.location.longitude
      ? { lat: room.location.latitude, lng: room.location.longitude }
      : null
  );
  const [nearbyAmenities, setNearbyAmenities] = useState<Array<{ name: string; lat: number; lng: number; distance: number }>>([]);
  const [loadingAmenities, setLoadingAmenities] = useState<boolean>(false);
  const [selectedPlace, setSelectedPlace] = useState<{ name: string; lat: number; lng: number } | null>(null);

  useEffect(() => {
    setSelectedPlace(null);
  }, [selectedCategory]);

  useEffect(() => {
    if (coords) return;
    let isMounted = true;
    const geocode = async () => {
      const cleanCity = room.city.replace(/TPHCM|TP\.HCM|tp\.hcm/gi, "Hồ Chí Minh");
      
      // Layer 1: Try full address query
      try {
        const query = `${room.address}, ${cleanCity}`;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
          { headers: { "Accept-Language": "vi", "User-Agent": "TmdtTestApp/1.0" } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data[0] && isMounted) {
            setCoords({
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
            });
            return;
          }
        }
      } catch (err) {
        console.error("Nominatim geocoding layer 1 error:", err);
      }

      // Layer 2: Cleanup address (strip house number/prefixes, use road + district + city)
      try {
        const parts = room.address.split(",").map(p => p.trim());
        if (parts.length >= 2) {
          let street = parts[0];
          // Strip house numbers
          street = street.replace(/^\d+[\/\w]*\s+/, "");
          street = street.replace(/^(Số|Hẻm|Ngõ|Kiệt|Đường)\s+\d+[\/\w]*\s+/, "");
          
          const district = parts.length >= 3 ? parts[parts.length - 2] : parts[1];
          const query = `${street}, ${district}, ${cleanCity}`;
          
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
            { headers: { "Accept-Language": "vi", "User-Agent": "TmdtTestApp/1.0" } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data[0] && isMounted) {
              setCoords({
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
              });
              return;
            }
          }
        }
      } catch (err) {
        console.error("Nominatim geocoding layer 2 error:", err);
      }

      // Layer 3: Fallback to District + City
      try {
        const parts = room.address.split(",").map(p => p.trim());
        const district = parts.length >= 3 ? parts[parts.length - 2] : (parts.length >= 2 ? parts[1] : "");
        const query = `${district}, ${cleanCity}`;
        
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
          { headers: { "Accept-Language": "vi", "User-Agent": "TmdtTestApp/1.0" } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data[0] && isMounted) {
            setCoords({
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
            });
            return;
          }
        }
      } catch (err) {
        console.error("Nominatim geocoding layer 3 error:", err);
      }
    };
    geocode();
    return () => {
      isMounted = false;
    };
  }, [room.address, room.city, coords]);

  useEffect(() => {
    if (!coords || !selectedCategory) {
      setNearbyAmenities([]);
      return;
    }

    let isMounted = true;
    const fetchAmenities = async () => {
      setLoadingAmenities(true);
      try {
        const { lat, lng } = coords;
        const radius = 1500;
        const osmTag = selectedCategory.osmTag;
        
        const query = `[out:json];(node(around:${radius},${lat},${lng})${osmTag};way(around:${radius},${lat},${lng})${osmTag};);out center;`;
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error("Overpass API failed");
        
        const data = await res.json();
        if (!isMounted) return;

        const items = (data.elements || [])
          .map((el: any) => {
            const name = el.tags?.name || el.tags?.brand || el.tags?.operator || `${selectedCategory.label} lân cận`;
            const itemLat = el.lat ?? el.center?.lat;
            const itemLng = el.lon ?? el.center?.lon;
            const distance = getDistanceInMeters(lat, lng, itemLat, itemLng);
            return { name, lat: itemLat, lng: itemLng, distance };
          })
          .filter((item: any) => item.lat && item.lng)
          .filter((item: any, idx: number, arr: any[]) => 
            arr.findIndex((t) => t.name === item.name && Math.abs(t.distance - item.distance) < 50) === idx
          )
          .sort((a: any, b: any) => a.distance - b.distance)
          .slice(0, 6);

        setNearbyAmenities(items);
      } catch (err) {
        console.error("Overpass API fetch error:", err);
      } finally {
        if (isMounted) {
          setLoadingAmenities(false);
        }
      }
    };

    fetchAmenities();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory, coords]);

  const renderPropertyDetails = () => {
    const details = room.details || {};
    const type = room.propertyType;

    if (type === "can_ho_chung_cu") {
      return (
        <div className="mt-6 border-t border-slate-100 pt-6">
          <h3 className="text-lg font-bold text-[#0b5f89] mb-4">Chi tiết căn hộ</h3>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
            {room.subtitle && <DetailItem label="Dự án" value={room.subtitle} />}
            {details.bedrooms !== undefined && <DetailItem label="Phòng ngủ" value={`${details.bedrooms} phòng`} />}
            {details.bathrooms !== undefined && <DetailItem label="Phòng tắm" value={`${details.bathrooms} phòng`} />}
            {details.apartmentFloor !== undefined && <DetailItem label="Tầng số" value={`Tầng ${details.apartmentFloor}`} />}
            {details.buildingFloors !== undefined && <DetailItem label="Tổng số tầng" value={`${details.buildingFloors} tầng`} />}
            {details.hasBalcony !== undefined && (
              <DetailItem 
                label="Ban công" 
                value={details.hasBalcony ? `Có (${details.balconyDirection || "chưa rõ"})` : "Không"} 
              />
            )}
            {details.interiorStatus && <DetailItem label="Nội thất" value={details.interiorStatus} />}
            {details.managementFee !== undefined && (
              <DetailItem 
                label="Phí quản lý" 
                value={details.managementFee > 0 ? `${details.managementFee.toLocaleString("vi-VN")}đ/tháng` : "Miễn phí"} 
              />
            )}
          </div>
        </div>
      );
    }

    if (type === "nha_o") {
      return (
        <div className="mt-6 border-t border-slate-100 pt-6">
          <h3 className="text-lg font-bold text-[#0b5f89] mb-4">Chi tiết nhà ở</h3>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
            {room.subtitle && <DetailItem label="Tên nhà" value={room.subtitle} />}
            {details.landArea !== undefined && <DetailItem label="Diện tích đất" value={`${details.landArea} m²`} />}
            {details.usableArea !== undefined && <DetailItem label="Diện tích sử dụng" value={`${details.usableArea} m²`} />}
            {details.bedrooms !== undefined && <DetailItem label="Phòng ngủ" value={`${details.bedrooms} phòng`} />}
            {details.bathrooms !== undefined && <DetailItem label="Phòng tắm" value={`${details.bathrooms} phòng`} />}
            {details.floors !== undefined && <DetailItem label="Số tầng" value={`${details.floors} tầng`} />}
            {details.frontage !== undefined && <DetailItem label="Mặt tiền" value={`${details.frontage} m`} />}
            {details.alleyWidth !== undefined && <DetailItem label="Đường/Hẻm rộng" value={`${details.alleyWidth} m`} />}
            {details.houseDirection && <DetailItem label="Hướng nhà" value={details.houseDirection} />}
            {details.interiorStatus && <DetailItem label="Nội thất" value={details.interiorStatus} />}
            {details.legalStatus && <DetailItem label="Pháp lý" value={details.legalStatus} />}
          </div>
        </div>
      );
    }

    if (type === "phong_tro") {
      return (
        <div className="mt-6 border-t border-slate-100 pt-6">
          <h3 className="text-lg font-bold text-[#0b5f89] mb-4">Chi tiết phòng trọ</h3>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
            {details.area !== undefined && <DetailItem label="Diện tích" value={`${details.area} m²`} />}
            {details.maxOccupants !== undefined && <DetailItem label="Số người tối đa" value={`${details.maxOccupants} người`} />}
            {details.hasLoft !== undefined && <DetailItem label="Gác lửng" value={details.hasLoft ? "Có gác" : "Không gác"} />}
            {details.hasPrivateWc !== undefined && <DetailItem label="WC riêng" value={details.hasPrivateWc ? "WC riêng biệt" : "WC chung"} />}
            {details.curfewFree !== undefined && <DetailItem label="Chung chủ" value={details.curfewFree ? "Không chung chủ (Tự do)" : "Chung chủ"} />}
            {details.hasAirConditioner !== undefined && <DetailItem label="Máy lạnh" value={details.hasAirConditioner ? "Đã trang bị" : "Không có"} />}
            {details.hasFridge !== undefined && <DetailItem label="Tủ lạnh" value={details.hasFridge ? "Đã trang bị" : "Không có"} />}
            {details.hasWashingMachine !== undefined && <DetailItem label="Máy giặt" value={details.hasWashingMachine ? "Đã trang bị" : "Không có"} />}
            {details.hasParking !== undefined && <DetailItem label="Có chỗ để xe" value={details.hasParking ? "Có" : "Không"} />}
            {details.allowPets !== undefined && <DetailItem label="Cho nuôi thú cưng" value={details.allowPets ? "Được phép" : "Không được phép"} />}
            {details.utilityPricing && <DetailItem label="Giá điện/nước" value={details.utilityPricing} />}
          </div>
        </div>
      );
    }

    return null;
  };

  const [isSaved, setIsSaved] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [checkingSave, setCheckingSave] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const checkSavedStatus = async () => {
      try {
        const authRes = await fetch("/api/v1/auth/me");
        if (!authRes.ok) {
          if (isMounted) setCheckingSave(false);
          return;
        }
        const authData = await authRes.json();
        if (authData.success && authData.data) {
          if (isMounted) setIsAuth(true);
          // Check saved status
          const savedRes = await fetch(`/api/v1/user/saved-posts?postId=${room.id}`);
          if (savedRes.ok) {
            const savedData = await savedRes.json();
            if (isMounted && savedData.success) {
              setIsSaved(savedData.isSaved);
            }
          }
        }
      } catch (error) {
        console.error("Failed to check saved status:", error);
      } finally {
        if (isMounted) setCheckingSave(false);
      }
    };
    checkSavedStatus();
    return () => {
      isMounted = false;
    };
  }, [room.id]);

  const handleToggleSave = async () => {
    if (!isAuth) {
      // Redirect to login page
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    const previousSaved = isSaved;
    setIsSaved(!previousSaved);

    try {
      if (previousSaved) {
        // Unsave
        const res = await fetch(`/api/v1/user/saved-posts?postId=${room.id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to unsave");
        }
        toast.success("Đã xóa phòng khỏi danh sách yêu thích!");
      } else {
        // Save
        const res = await fetch("/api/v1/user/saved-posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: room.id }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to save");
        }
        toast.success("Đã lưu phòng vào danh sách yêu thích!");
      }
    } catch (error) {
      // Rollback on error
      setIsSaved(previousSaved);
      toast.error("Đã xảy ra lỗi, vui lòng thử lại sau!");
      console.error("Failed to update saved status:", error);
    }
  };

  while (gallery.length < 5) {
    gallery.push(room.imageUrls[0]);
  }

  const activeImageUrl = gallery[activeImageIndex] ?? gallery[0];
  const previewImages = gallery.slice(0, 5);

  return (
    <main className="flex-1 bg-[#f5f7f9] pb-16">
      <section className="mx-auto w-full max-w-400 px-4 pt-8 lg:px-8">
        <nav className="mb-5 text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-[#0b7ea9]">
                Trang chủ
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <span>Phòng trọ</span>
            </li>
            <li aria-hidden>/</li>
            <li>
              <span className="text-slate-700">{room.title}</span>
            </li>
          </ol>
        </nav>

        <section className="mb-7 grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
          <div className="overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_18px_45px_rgba(15,23,42,0.10)]">
            <div className="relative">
              <GalleryTile imageUrl={activeImageUrl} className="h-[360px] rounded-none md:h-[470px]" />
              <div className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                {activeImageIndex + 1} / {room.imageUrls.length}
              </div>
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((current) => (current - 1 + room.imageUrls.length) % room.imageUrls.length)}
                  className="rounded-full bg-white/95 px-3.5 py-2 text-sm font-semibold text-slate-800 shadow-lg transition hover:bg-white"
                >
                  Trước
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((current) => (current + 1) % room.imageUrls.length)}
                  className="rounded-full bg-white/95 px-3.5 py-2 text-sm font-semibold text-slate-800 shadow-lg transition hover:bg-white"
                >
                  Sau
                </button>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 p-3 md:gap-3 md:p-4">
              {previewImages.map((imageUrl, index) => {
                const isActive = index === activeImageIndex;

                return (
                  <button
                    key={`${imageUrl}-${index}`}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative overflow-hidden rounded-2xl border transition ${isActive ? "border-[#0b7ea9] ring-2 ring-[#0b7ea9]/20" : "border-slate-200 hover:border-[#8cd7db]"}`}
                    aria-label={`Xem ảnh ${index + 1}`}
                  >
                    <span className="block h-24 bg-cover bg-center md:h-28" style={{ backgroundImage: `url(${imageUrl})` }} aria-hidden />
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <article className="rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.12)] md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0b7ea9]">Tin đăng</p>
                  <h1 className="mt-2 text-[20px] font-bold leading-tight text-slate-900 md:text-[24px]">{room.title}</h1>
                </div>

                <button
                  type="button"
                  onClick={handleToggleSave}
                  disabled={checkingSave}
                  className={`inline-flex shrink-0 whitespace-nowrap items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition ${
                    isSaved
                      ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300"
                      : "border-slate-200 bg-white text-slate-700 hover:border-[#8cd7db] hover:text-[#0b7ea9]"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill={isSaved ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path d="M12.1 20.3l-1.1-1C6 15 3 12.3 3 8.9 3 6.1 5.1 4 7.9 4c1.6 0 3.1.8 4.1 2.1C13 4.8 14.5 4 16.1 4 18.9 4 21 6.1 21 8.9c0 3.4-3 6.1-8 10.4l-.9 1z" />
                  </svg>
                  {isSaved ? "Đã lưu" : "Lưu"}
                </button>
              </div>

              <p className="mt-3 text-[15px] leading-7 text-slate-600 md:text-[16px]">{room.subtitle}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#e8fbfc] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#0b7ea9]">
                  {room.location.districtLabel}
                </span>
                <span className="rounded-full bg-[#eef6ff] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#3563a6]">
                  {room.availableRoomsLabel}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-3xl bg-[#f6fcfd] p-4">
                  <p className="text-sm text-slate-500">Giá thuê</p>
                  <p className="mt-1 text-[18px] font-bold text-[#f2483a]">{room.priceLabel}</p>
                </div>
                <div className="rounded-3xl bg-[#f6fcfd] p-4">
                  <p className="text-sm text-slate-500">Diện tích</p>
                  <p className="mt-1 text-[18px] font-bold text-[#0b5f89]">{room.areaLabel}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                  {room.contact.responseTime}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 font-medium">
                  <span className="h-2 w-2 rounded-full bg-[#25c3c8]" aria-hidden />
                  Cập nhật mới
                </span>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center rounded-2xl bg-[#0b7ea9] px-4 py-3.5 font-semibold text-white transition hover:bg-[#0a7198]"
                >
                  Chia sẻ
                </button>
                <a
                  href={`tel:${contactPhoneHref}`}
                  className="inline-flex flex-1 items-center justify-center rounded-2xl border border-[#0b7ea9] px-4 py-3.5 font-semibold text-[#0b7ea9] transition hover:bg-[#effaff]"
                >
                  Gọi ngay
                </a>
              </div>
            </article>

            <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.08)] md:p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0b7ea9]">Địa chỉ</p>
              <p className="mt-2 text-[16px] leading-7 text-slate-700">
                {room.address}, {room.city}
              </p>
              <p className="mt-2 text-sm text-slate-500">{room.location.mapLabel}</p>
              <p className="mt-4 text-sm font-medium text-slate-500">{room.contact.responseTime}</p>
            </article>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <div className="space-y-6">
            <article className="rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.08)] md:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[20px] font-bold text-[#0b5f89] md:text-[24px]">Đặc điểm bất động sản</h2>
                <span className="rounded-full bg-[#eefcfd] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0b7ea9]">
                  Tổng quan
                </span>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] bg-[#f7fbfc] p-4">
                  <p className="text-sm text-slate-500">Giá thuê</p>
                  <p className="mt-1 text-[18px] font-bold text-[#f2483a]">{room.priceLabel}</p>
                </div>
                <div className="rounded-[24px] bg-[#f7fbfc] p-4">
                  <p className="text-sm text-slate-500">Diện tích</p>
                  <p className="mt-1 text-[18px] font-bold text-[#0b5f89]">{room.areaLabel}</p>
                </div>
                <div className="rounded-[24px] bg-[#f7fbfc] p-4">
                  <p className="text-sm text-slate-500">Đặt cọc</p>
                  <p className="mt-1 text-[16px] font-semibold text-slate-800">{room.depositLabel}</p>
                </div>
                <div className="rounded-[24px] bg-[#f7fbfc] p-4">
                  <p className="text-sm text-slate-500">Số phòng trống</p>
                  <p className="mt-1 text-[16px] font-semibold text-slate-800">{room.availableRoomsLabel}</p>
                </div>
              </div>

              <p className="mt-5 text-[14px] leading-7 text-slate-600 md:text-[15px]">{room.description}</p>

              {renderPropertyDetails()}
            </article>

            <article className="rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.08)] md:p-7">
              <h2 className="text-[20px] font-bold text-[#0b5f89] md:text-[24px]">Phí dịch vụ chung</h2>
              <div className="mt-4 rounded-[28px] bg-[#f7fbfc] p-4 md:p-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    { title: "Tiền điện", value: room.electricityPriceLabel, icon: <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z" /> },
                    { title: "Tiền nước", value: room.waterPriceLabel, icon: <path d="M12 2s6 6.2 6 11a6 6 0 1 1-12 0c0-4.8 6-11 6-11Z" /> },
                    { title: "Đặt cọc", value: room.depositLabel, icon: <path d="M11 2h2l1 7h4l-6 13-1-8H7l4-12Z" /> },
                    { title: "Diện tích", value: room.areaLabel, icon: <path d="M4 7V4h3M20 7V4h-3M4 17v3h3M20 17v3h-3M7 4h10M7 20h10" /> },
                  ].map((item) => (
                    <div key={item.title} className="flex items-center gap-3 rounded-[22px] bg-white px-4 py-4 shadow-sm">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eaf9fa] text-[#25c3c8]">
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                          {item.icon}
                        </svg>
                      </span>
                      <div>
                        <p className="text-[13px] font-medium text-slate-600 md:text-[14px]">{item.title}</p>
                        <p className="text-[13px] font-semibold text-[#0b7ea9] md:text-[14px]">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            {room.amenities && room.amenities.length > 0 && (
              <article className="rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.08)] md:p-7">
                <h2 className="text-[20px] font-bold text-[#0b5f89] md:text-[24px]">Tiện ích chung</h2>
                <div className="mt-4 rounded-[28px] bg-[#f7fbfc] p-5 md:p-7">
                  <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                    {room.amenities.map((amenity, index) => {
                      const normalizedAmenity = normalizeAmenity(amenity, index);

                      return (
                        <div key={normalizedAmenity.id} className="flex items-start gap-2.5 text-[14px] text-slate-600 md:text-[15px]">
                          <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                            <AmenityIcon slug={normalizedAmenity.slug} />
                          </span>
                          <span className="leading-7">{normalizedAmenity.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </article>
            )}

            <article className="rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.08)] md:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-[20px] font-bold text-[#0b5f89] md:text-[24px]">Vị trí & Tiện ích</h2>
                  <p className="mt-1 text-[15px] text-slate-600">{room.location.districtLabel}</p>
                </div>

                <span className="rounded-full bg-[#ecfeff] px-4 py-2 text-[13px] font-semibold text-[#0b7ea9]">
                  {room.location.mapLabel}
                </span>
              </div>

              {/* Amenity Categories Tabs */}
              <div className="mt-5 flex gap-2 overflow-x-auto pb-3 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className={`inline-flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold border transition ${
                    selectedCategory === null
                      ? "bg-[#0b7ea9] border-transparent text-white shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:border-[#8cd7db] hover:bg-white"
                  }`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  Mặc định
                </button>
                {AMENITY_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = selectedCategory?.id === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`inline-flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold border transition ${
                        isActive
                          ? "bg-[#0b7ea9] border-transparent text-white shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:border-[#8cd7db] hover:bg-white"
                      }`}
                    >
                      <Icon />
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
                <div className="min-w-0">
                  {selectedCategory ? (
                    <div className="rounded-3xl bg-[#f6fcfd] border border-[#eaf6f7] p-5 md:p-6 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-[16px] font-bold text-[#0b5f89] md:text-[18px]">
                          {selectedCategory.label} gần đây (1.5km)
                        </span>
                        {loadingAmenities && (
                          <span className="text-xs text-[#0b7ea9] animate-pulse">Đang tìm kiếm...</span>
                        )}
                      </div>
                      
                      {loadingAmenities ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-100 border border-slate-200/50" />
                          ))}
                        </div>
                      ) : nearbyAmenities.length > 0 ? (
                        <ul className="space-y-2.5">
                          {nearbyAmenities.map((place, index) => {
                            const distanceText = place.distance < 1000 
                              ? `${Math.round(place.distance)} m` 
                              : `${(place.distance / 1000).toFixed(1)} km`;
                            const isSelected = selectedPlace?.name === place.name;
                            return (
                              <li 
                                key={index} 
                                onClick={() => setSelectedPlace(isSelected ? null : place)}
                                className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-[14px] shadow-sm border transition md:text-[15px] cursor-pointer ${
                                  isSelected
                                    ? "bg-[#effaff] border-[#0b7ea9] text-[#0b7ea9] font-bold"
                                    : "bg-white border-slate-100 text-slate-700 hover:border-[#8cd7db]"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${
                                    isSelected ? "bg-[#0b7ea9] text-white" : "bg-[#eaf9fa] text-[#0b7ea9]"
                                  }`}>
                                    <selectedCategory.icon />
                                  </span>
                                  <span className="truncate">{place.name}</span>
                                </div>
                                <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full transition ${
                                  isSelected ? "bg-[#0b7ea9]/15 text-[#0b7ea9]" : "bg-slate-100 text-slate-400"
                                }`}>{distanceText}</span>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="text-center text-sm text-slate-500 py-8">
                          Không tìm thấy {selectedCategory.label.toLowerCase()} nào gần đây.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="rounded-3xl bg-slate-50 p-5 md:p-6 shadow-sm border border-slate-100">
                        <div className="mb-4 text-[16px] font-bold text-slate-700 md:text-[18px]">Mô tả vị trí</div>
                        <p className="text-sm leading-6 text-slate-500">
                          Nằm tại khu vực an ninh, giao thông thuận tiện. Bạn có thể sử dụng các tab tiện ích phía trên để tra cứu nhanh các dịch vụ công cộng và cơ sở hạ tầng xung quanh bài đăng này.
                        </p>
                      </div>

                      {room.location.nearbyPlaces && room.location.nearbyPlaces.length > 0 && (
                        <div className="mt-5 rounded-3xl bg-[#f6f6f6] p-5 md:p-7">
                          <div className="mb-4 text-[16px] font-semibold text-slate-800 md:text-[18px]">Khu vực lân cận</div>
                          <ul className="space-y-3">
                            {room.location.nearbyPlaces.map((place) => (
                              <li key={place} className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 text-[15px] text-slate-700 shadow-sm md:text-[17px]">
                                <span className="mt-2 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-[#25c3c8]" aria-hidden />
                                <span className="leading-7">{place}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-inner">
                  <div className="relative h-72 md:h-full md:min-h-[420px]">
                    <iframe
                      src={
                        selectedPlace && coords
                          ? `https://maps.google.com/maps?hl=vi&saddr=${coords.lat},${coords.lng}&daddr=${selectedPlace.lat},${selectedPlace.lng}&z=15&output=embed`
                          : `https://maps.google.com/maps?hl=vi&q=${encodeURIComponent(
                              selectedCategory
                                ? `${selectedCategory.query} gần ${coords ? `${coords.lat},${coords.lng}` : `${room.address}, ${room.city}`}`
                                : coords
                                  ? `${coords.lat},${coords.lng}`
                                  : `${room.address}, ${room.city}`
                            )}&z=15&output=embed`
                      }
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      title={`Ban do ${room.title}`}
                      className="grayscale transition-all duration-700 hover:grayscale-0"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            </article>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <article className="rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.12)] md:p-6">
              <div className="flex items-center gap-3">
                <div
                  className="h-14 w-14 rounded-2xl bg-cover bg-center shadow-sm ring-1 ring-white"
                  style={{ backgroundImage: `url(${room.contact.avatarUrl})` }}
                  aria-hidden
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0b7ea9]">Liên hệ chủ phòng</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{room.contact.name}</p>
                  <p className="text-sm text-slate-500">{room.contact.responseTime}</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <a
                  href={`tel:${contactPhoneHref}`}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-[#0b7ea9] px-4 py-3.5 text-base font-semibold text-white transition hover:bg-[#0a7198]"
                >
                  Gọi ngay {room.contact.phone}
                </a>
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-[#0b7ea9] px-4 py-3.5 text-base font-semibold text-[#0b7ea9] transition hover:bg-[#effaff]"
                >
                  Nhắn tin Zalo
                </button>
              </div>

              <div className="mt-5 grid gap-3 rounded-2xl bg-[#f7fbfc] p-4 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-3">
                  <span>Vị trí</span>
                  <span className="font-semibold text-slate-900">{room.location.districtLabel}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Trạng thái</span>
                  <span className="font-semibold text-slate-900">{room.availableRoomsLabel}</span>
                </div>
              </div>
            </article>

            <article className="rounded-[28px] border border-slate-200 bg-[#f4f8fa] p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)] md:p-5">
              <h2 className="text-[22px] font-extrabold text-[#0b5f89]">Đánh giá</h2>
              <div className="mx-auto mt-4 grid max-w-[300px] grid-cols-2 items-center rounded-3xl bg-white p-4 shadow-sm">
                <div className="pr-4 text-center">
                  <p className="text-[28px] font-black leading-none text-slate-900">8,8</p>
                  <p className="mt-1 text-[15px] tracking-wide text-[#f59e0b]">★ ★ ★ ★ ★</p>
                </div>

                <div className="border-l border-slate-200 pl-4 text-center">
                  <p className="text-[24px] font-black leading-none text-slate-900">102</p>
                  <p className="text-sm text-slate-600">Đánh giá</p>
                </div>
              </div>
            </article>

            {relatedRooms && relatedRooms.length > 0 && (
              <article className="rounded-[28px] border border-white/70 bg-white p-4 shadow-[0_14px_30px_rgba(15,23,42,0.08)] md:p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-[22px] font-extrabold text-slate-900">Phòng liên quan</h2>
                  <span className="rounded-full bg-[#eefcfd] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0b7ea9]">
                    {relatedRooms.length}
                  </span>
                </div>
                <div className="mt-3 space-y-3">
                  {relatedRooms.map((item) => (
                    <Link
                      key={item.id}
                      href={buildRoomRouteFromSlug(item.slug)}
                      className="group block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-[#7ed9dd] hover:bg-white hover:shadow-md"
                    >
                      <p className="font-semibold text-slate-900 transition group-hover:text-[#0b7ea9]">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.address}</p>
                      <p className="mt-3 text-base font-extrabold text-[#f2483a]">{item.priceLabel}</p>
                    </Link>
                  ))}
                </div>
              </article>
            )}
          </aside>
        </section>
      </section>
    </main>
  );
}
