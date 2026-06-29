"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GooglePlacesInput } from "@/src/components/GooglePlacesInput";
import { buildRoomRouteFromSlug } from "../servers";
import type { RoomDetailData } from "../types";
import { SaveRoomButton } from "./save-room-button";
import { RoomCompareModal } from "./room-compare-modal";

type RangeOption = {
  id: string;
  label: string;
  min?: number;
  max?: number;
};

type Filters = {
  keyword: string;
  locationText: string;
  city: string;
  district: string;
  lat: string;
  lng: string;
  radiusKm: string;
  priceRanges: string[];
  areaRanges: string[];
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  amenities: string[];
  propertyType: string;
  interiorStatus: string;
  allowPets: string;
  curfewFree: string;
  minBedrooms: string;
  minBathrooms: string;
  page: string;
};

const PRICE_OPTIONS: readonly RangeOption[] = [
  { id: "under-2", label: "Dưới 2 triệu", max: 2_000_000 },
  { id: "2-4", label: "2 - 4 triệu", min: 2_000_000, max: 4_000_000 },
  { id: "4-6", label: "4 - 6 triệu", min: 4_000_000, max: 6_000_000 },
  { id: "6-8", label: "6 - 8 triệu", min: 6_000_000, max: 8_000_000 },
  { id: "8-10", label: "8 - 10 triệu", min: 8_000_000, max: 10_000_000 },
  { id: "over-10", label: "Trên 10 triệu", min: 10_000_000 },
];

const AREA_OPTIONS: readonly RangeOption[] = [
  { id: "under-20", label: "Dưới 20 m2", max: 20 },
  { id: "20-30", label: "20 - 30 m2", min: 20, max: 30 },
  { id: "30-40", label: "30 - 40 m2", min: 30, max: 40 },
  { id: "40-60", label: "40 - 60 m2", min: 40, max: 60 },
  { id: "over-60", label: "Trên 60 m2", min: 60 },
];

const AMENITY_OPTIONS = [
  { id: "air-conditioner", label: "Máy lạnh" },
  { id: "fridge", label: "Tủ lạnh" },
  { id: "washing-machine", label: "Máy giặt" },
  { id: "parking", label: "Chỗ để xe" },
  { id: "private-wc", label: "WC riêng" },
  { id: "loft", label: "Gác lửng" },
  { id: "balcony", label: "Ban công" },
];

const PROPERTY_TYPE_OPTIONS = [
  { value: "", label: "Tất cả loại phòng" },
  { value: "phong_tro", label: "Phòng trọ" },
  { value: "can_ho_chung_cu", label: "Căn hộ/chung cư" },
  { value: "nha_o", label: "Nhà ở" },
];

const INTERIOR_OPTIONS = [
  { value: "", label: "Tất cả nội thất" },
  { value: "đầy đủ", label: "Nội thất đầy đủ" },
  { value: "cơ bản", label: "Nội thất cơ bản" },
  { value: "không nội thất", label: "Không nội thất" },
];

const RADIUS_OPTIONS = [1, 3, 5, 10, 15];

const DEFAULT_FILTERS: Filters = {
  keyword: "",
  locationText: "",
  city: "",
  district: "",
  lat: "",
  lng: "",
  radiusKm: "3",
  priceRanges: [],
  areaRanges: [],
  minPrice: "",
  maxPrice: "",
  minArea: "",
  maxArea: "",
  amenities: [],
  propertyType: "",
  interiorStatus: "",
  allowPets: "",
  curfewFree: "",
  minBedrooms: "",
  minBathrooms: "",
  page: "1",
};

function buildRangeParam(range: RangeOption): string {
  const min = range.min ?? "";
  const max = range.max ?? "";
  return `${min}-${max}`;
}

function toggleFromList(value: string, selected: string[]): string[] {
  if (selected.includes(value)) {
    return selected.filter((item) => item !== value);
  }

  return [...selected, value];
}

function parseSearchParams(params: URLSearchParams): Filters {
  const priceRanges = params.getAll("priceRange");
  const areaRanges = params.getAll("areaRange");
  const amenities = params.getAll("amenities");

  return {
    ...DEFAULT_FILTERS,
    keyword: params.get("q") ?? "",
    locationText: params.get("locationText") ?? "",
    city: params.get("city") ?? "",
    district: params.get("district") ?? "",
    lat: params.get("lat") ?? "",
    lng: params.get("lng") ?? "",
    radiusKm: params.get("radiusKm") ?? DEFAULT_FILTERS.radiusKm,
    priceRanges,
    areaRanges,
    minPrice: params.get("minPrice") ?? "",
    maxPrice: params.get("maxPrice") ?? "",
    minArea: params.get("minArea") ?? "",
    maxArea: params.get("maxArea") ?? "",
    amenities,
    propertyType: params.get("propertyType") ?? "",
    interiorStatus: params.get("interiorStatus") ?? "",
    allowPets: params.get("allowPets") ?? "",
    curfewFree: params.get("curfewFree") ?? "",
    minBedrooms: params.get("minBedrooms") ?? "",
    minBathrooms: params.get("minBathrooms") ?? "",
    page: params.get("page") ?? "1",
  };
}

function buildQueryParams(filters: Filters): URLSearchParams {
  const params = new URLSearchParams();
  const lat = Number(filters.lat);
  const lng = Number(filters.lng);
  const radiusKm = Number(filters.radiusKm);

  if (filters.keyword.trim()) {
    params.set("q", filters.keyword.trim());
  }

  if (filters.locationText.trim()) {
    params.set("locationText", filters.locationText.trim());
  }

  if (filters.city.trim()) {
    params.set("city", filters.city.trim());
  }

  if (filters.district.trim()) {
    params.set("district", filters.district.trim());
  }

  if (
    Number.isFinite(lat) &&
    lat >= -90 &&
    lat <= 90 &&
    Number.isFinite(lng) &&
    lng >= -180 &&
    lng <= 180
  ) {
    params.set("lat", String(lat));
    params.set("lng", String(lng));
    if (Number.isFinite(radiusKm) && radiusKm > 0) {
      params.set("radiusKm", String(radiusKm));
    }
  }

  if (filters.minPrice.trim()) {
    const minPrice = Number(filters.minPrice);
    if (Number.isFinite(minPrice) && minPrice >= 0) {
      params.set("minPrice", String(minPrice));
    }
  }

  if (filters.maxPrice.trim()) {
    const maxPrice = Number(filters.maxPrice);
    if (Number.isFinite(maxPrice) && maxPrice >= 0) {
      params.set("maxPrice", String(maxPrice));
    }
  }

  if (filters.minArea.trim()) {
    const minArea = Number(filters.minArea);
    if (Number.isFinite(minArea) && minArea >= 0) {
      params.set("minArea", String(minArea));
    }
  }

  if (filters.maxArea.trim()) {
    const maxArea = Number(filters.maxArea);
    if (Number.isFinite(maxArea) && maxArea >= 0) {
      params.set("maxArea", String(maxArea));
    }
  }

  if (!params.has("minPrice") && !params.has("maxPrice")) {
    filters.priceRanges.forEach((range) => params.append("priceRange", range));
  }

  if (!params.has("minArea") && !params.has("maxArea")) {
    filters.areaRanges.forEach((range) => params.append("areaRange", range));
  }

  filters.amenities.forEach((amenity) => params.append("amenities", amenity));

  if (filters.propertyType) {
    params.set("propertyType", filters.propertyType);
  }

  if (filters.interiorStatus) {
    params.set("interiorStatus", filters.interiorStatus);
  }

  if (filters.allowPets) {
    params.set("allowPets", filters.allowPets);
  }

  if (filters.curfewFree) {
    params.set("curfewFree", filters.curfewFree);
  }

  const minBedrooms = Number(filters.minBedrooms);
  if (Number.isFinite(minBedrooms) && minBedrooms > 0) {
    params.set("minBedrooms", String(minBedrooms));
  }

  const minBathrooms = Number(filters.minBathrooms);
  if (Number.isFinite(minBathrooms) && minBathrooms > 0) {
    params.set("minBathrooms", String(minBathrooms));
  }

  if (filters.page && filters.page !== "1") {
    params.set("page", filters.page);
  }

  return params;
}

function resetPage(filters: Filters): Filters {
  return { ...filters, page: "1" };
}

export function RoomSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const didInit = useRef(false);

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [rooms, setRooms] = useState<RoomDetailData[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number }>({
    total: 0,
    page: 1,
    limit: 12,
  });
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(true);

  // Compare state
  const [selectedForCompare, setSelectedForCompare] = useState<RoomDetailData[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    const loadCompareRooms = () => {
      try {
        const stored = localStorage.getItem("compareRooms");
        if (stored) {
          setSelectedForCompare(JSON.parse(stored));
        }
      } catch (e) {}
    };
    loadCompareRooms();

    window.addEventListener("compareRoomsUpdated", loadCompareRooms);
    return () => window.removeEventListener("compareRoomsUpdated", loadCompareRooms);
  }, []);

  const toggleCompare = (room: RoomDetailData) => {
    setSelectedForCompare((prev) => {
      let newRooms = [];
      const isSelected = prev.some((r) => r.id === room.id);
      if (isSelected) {
        newRooms = prev.filter((r) => r.id !== room.id);
      } else {
        if (prev.length >= 3) {
          alert("Chỉ được chọn tối đa 3 phòng để so sánh");
          return prev;
        }
        // Giảm dung lượng object để tránh lỗi QuotaExceededError
        const minimalRoom = {
          id: room.id,
          title: room.title,
          priceLabel: room.priceLabel,
          areaLabel: room.areaLabel,
          propertyType: room.propertyType,
          address: room.address,
          city: room.city,
          location: room.location,
          imageUrls: room.imageUrls && room.imageUrls.length > 0 ? [room.imageUrls[0]] : [],
          amenities: room.amenities,
        };
        newRooms = [...prev, minimalRoom as any];
      }
      try {
        localStorage.setItem("compareRooms", JSON.stringify(newRooms));
      } catch (error) {
        console.error("Local storage limit exceeded:", error);
        alert("Bộ nhớ đã đầy, không thể thêm phòng. Vui lòng thử lại sau.");
      }
      return newRooms as RoomDetailData[];
    });
  };

  const clearCompare = () => {
    setSelectedForCompare([]);
    localStorage.removeItem("compareRooms");
  };

  useEffect(() => {
    if (didInit.current) {
      return;
    }

    const parsed = parseSearchParams(searchParams);
    setFilters(parsed);
    setAppliedFilters(parsed);
    didInit.current = true;
  }, [searchParams]);

  useEffect(() => {
    const params = buildQueryParams(appliedFilters);

    const loadRooms = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const response = await fetch(`/api/v1/rooms/search?${params.toString()}`);
        const payload = (await response.json()) as {
          success: boolean;
          data?: RoomDetailData[];
          message?: string;
          meta?: { total?: number; page?: number; limit?: number };
        };

        if (!response.ok || !payload.success) {
          setErrorMessage(payload.message ?? "Không thể tải danh sách phòng.");
          setRooms([]);
          return;
        }

        setRooms(payload.data ?? []);
        setMeta({
          total: payload.meta?.total ?? 0,
          page: payload.meta?.page ?? 1,
          limit: payload.meta?.limit ?? 12,
        });
      } catch {
        setErrorMessage("Không thể tải danh sách phòng.");
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, [appliedFilters]);

  const mapQuery = useMemo(() => {
    if (filters.lat && filters.lng) {
      return `${filters.lat},${filters.lng}`;
    }

    return (
      filters.locationText ||
      filters.district ||
      filters.city ||
      "Việt Nam"
    );
  }, [filters.city, filters.district, filters.lat, filters.lng, filters.locationText]);

  const mapSrc = useMemo(() => {
    return `https://maps.google.com/maps?hl=vi&q=${encodeURIComponent(mapQuery)}&z=13&output=embed`;
  }, [mapQuery]);

  function applyFilters() {
    const nextFilters = resetPage(filters);
    const params = buildQueryParams(nextFilters);
    router.replace(`/search?${params.toString()}`);
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    router.replace("/search");
  }

  return (
    <main className="flex-1 bg-[#f3f5f7] pb-14">
      <section className="mx-auto w-full max-w-400 px-4 pt-6 lg:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-[0_8px_26px_rgba(15,23,42,0.07)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-[30px] font-extrabold text-slate-900 md:text-[38px]">
                Tìm phòng cho thuê
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {meta.total.toLocaleString("vi-VN")} kết quả phù hợp
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full border border-slate-300 px-4 py-2 text-[15px] font-semibold text-slate-700"
              >
                Xóa lọc
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="rounded-full bg-slate-900 px-5 py-2 text-[15px] font-semibold text-white"
              >
                Tìm kiếm
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[15px] font-semibold text-slate-700">Từ khóa</label>
                  <input
                    value={filters.keyword}
                    onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))}
                    placeholder="Nhập tên khu vực, dự án, tuyến đường"
                    className="h-12 w-full rounded-xl border border-slate-300 px-4 text-[16px] text-slate-700 outline-none transition focus:border-[#0b7ea9] focus:ring-4 focus:ring-[#25c3c8]/20"
                  />
                </div>
                <GooglePlacesInput
                  label="Khu vực"
                  placeholder="Nhập địa điểm để lọc gần bạn"
                  value={filters.locationText}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      locationText: value,
                      city: "",
                      district: "",
                      lat: "",
                      lng: "",
                    }))
                  }
                  onPlaceSelected={(place) => {
                    if (!place) {
                      return;
                    }

                    setFilters((prev) => ({
                      ...prev,
                      locationText: place.address,
                      city: place.city ?? "",
                      district: place.district ?? "",
                      lat: place.lat ? String(place.lat) : "",
                      lng: place.lng ? String(place.lng) : "",
                    }));
                  }}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-[15px] font-semibold text-slate-700">Khoảng giá</p>
                  <div className="flex flex-wrap gap-2">
                    {PRICE_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            priceRanges: toggleFromList(buildRangeParam(option), prev.priceRanges),
                          }))
                        }
                        className={`rounded-full border px-3 py-1.5 text-[14px] font-semibold transition ${
                          filters.priceRanges.includes(buildRangeParam(option))
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-300 bg-white text-slate-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[15px] font-semibold text-slate-700">Diện tích</p>
                  <div className="flex flex-wrap gap-2">
                    {AREA_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            areaRanges: toggleFromList(buildRangeParam(option), prev.areaRanges),
                          }))
                        }
                        className={`rounded-full border px-3 py-1.5 text-[14px] font-semibold transition ${
                          filters.areaRanges.includes(buildRangeParam(option))
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-300 bg-white text-slate-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 text-[15px] font-semibold text-slate-700">Tiện ích cơ bản</p>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_OPTIONS.map((amenity) => (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          amenities: toggleFromList(amenity.id, prev.amenities),
                        }))
                      }
                      className={`rounded-full border px-3 py-1.5 text-[14px] font-semibold transition ${
                        filters.amenities.includes(amenity.id)
                          ? "border-[#0b7ea9] bg-[#0b7ea9] text-white"
                          : "border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      {amenity.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[16px] font-bold text-slate-900">Bộ lọc nâng cao</p>
                <button
                  type="button"
                  onClick={() => setIsAdvancedOpen((prev) => !prev)}
                  className="text-sm font-semibold text-slate-600"
                >
                  {isAdvancedOpen ? "Thu gọn" : "Mở rộng"}
                </button>
              </div>

              {isAdvancedOpen ? (
                <div className="mt-3 space-y-3 text-[14px]">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block font-semibold text-slate-700">Loại phòng</label>
                      <select
                        value={filters.propertyType}
                        onChange={(event) =>
                          setFilters((prev) => ({ ...prev, propertyType: event.target.value }))
                        }
                        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-[14px] text-slate-700"
                      >
                        {PROPERTY_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block font-semibold text-slate-700">Nội thất</label>
                      <select
                        value={filters.interiorStatus}
                        onChange={(event) =>
                          setFilters((prev) => ({ ...prev, interiorStatus: event.target.value }))
                        }
                        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-[14px] text-slate-700"
                      >
                        {INTERIOR_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block font-semibold text-slate-700">Thú cưng</label>
                      <select
                        value={filters.allowPets}
                        onChange={(event) =>
                          setFilters((prev) => ({ ...prev, allowPets: event.target.value }))
                        }
                        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-[14px] text-slate-700"
                      >
                        <option value="">Tất cả</option>
                        <option value="true">Cho phép</option>
                        <option value="false">Không cho phép</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block font-semibold text-slate-700">Giờ giấc</label>
                      <select
                        value={filters.curfewFree}
                        onChange={(event) =>
                          setFilters((prev) => ({ ...prev, curfewFree: event.target.value }))
                        }
                        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-[14px] text-slate-700"
                      >
                        <option value="">Tất cả</option>
                        <option value="true">Tự do</option>
                        <option value="false">Có giới hạn</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block font-semibold text-slate-700">Số phòng ngủ tối thiểu</label>
                      <input
                        type="number"
                        min={0}
                        value={filters.minBedrooms}
                        onChange={(event) =>
                          setFilters((prev) => ({ ...prev, minBedrooms: event.target.value }))
                        }
                        className="h-11 w-full rounded-xl border border-slate-300 px-3 text-[14px] text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-semibold text-slate-700">Số phòng tắm tối thiểu</label>
                      <input
                        type="number"
                        min={0}
                        value={filters.minBathrooms}
                        onChange={(event) =>
                          setFilters((prev) => ({ ...prev, minBathrooms: event.target.value }))
                        }
                        className="h-11 w-full rounded-xl border border-slate-300 px-3 text-[14px] text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block font-semibold text-slate-700">Giá từ (VNĐ)</label>
                      <input
                        type="number"
                        min={0}
                        value={filters.minPrice}
                        onChange={(event) =>
                          setFilters((prev) => ({ ...prev, minPrice: event.target.value }))
                        }
                        className="h-11 w-full rounded-xl border border-slate-300 px-3 text-[14px] text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-semibold text-slate-700">Giá đến (VNĐ)</label>
                      <input
                        type="number"
                        min={0}
                        value={filters.maxPrice}
                        onChange={(event) =>
                          setFilters((prev) => ({ ...prev, maxPrice: event.target.value }))
                        }
                        className="h-11 w-full rounded-xl border border-slate-300 px-3 text-[14px] text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block font-semibold text-slate-700">Diện tích từ (m2)</label>
                      <input
                        type="number"
                        min={0}
                        value={filters.minArea}
                        onChange={(event) =>
                          setFilters((prev) => ({ ...prev, minArea: event.target.value }))
                        }
                        className="h-11 w-full rounded-xl border border-slate-300 px-3 text-[14px] text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-semibold text-slate-700">Diện tích đến (m2)</label>
                      <input
                        type="number"
                        min={0}
                        value={filters.maxArea}
                        onChange={(event) =>
                          setFilters((prev) => ({ ...prev, maxArea: event.target.value }))
                        }
                        className="h-11 w-full rounded-xl border border-slate-300 px-3 text-[14px] text-slate-700"
                      />
                    </div>
                  </div>

                  {filters.lat && filters.lng ? (
                    <div>
                      <label className="mb-1 block font-semibold text-slate-700">Bán kính tìm kiếm</label>
                      <div className="flex flex-wrap gap-2">
                        {RADIUS_OPTIONS.map((radius) => (
                          <button
                            key={radius}
                            type="button"
                            onClick={() =>
                              setFilters((prev) => ({ ...prev, radiusKm: String(radius) }))
                            }
                            className={`rounded-full border px-3 py-1 text-[13px] font-semibold ${
                              filters.radiusKm === String(radius)
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-300 bg-white text-slate-700"
                            }`}
                          >
                            {radius} km
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <section className="mt-6">
          <div className="space-y-4">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
                Đang tải danh sách phòng...
              </div>
            ) : null}

            {!loading && errorMessage ? (
              <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center text-rose-500">
                {errorMessage}
              </div>
            ) : null}

            {!loading && !errorMessage && rooms.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
                Không có phòng phù hợp với bộ lọc hiện tại.
              </div>
            ) : null}

            {!loading && !errorMessage
              ? rooms.map((room) => (
                  <article
                    key={room.id}
                    className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
                  >
                    <SaveRoomButton roomId={room.id} />
                    <div className="grid md:grid-cols-[260px_1fr]">
                      <div
                        className="h-48 bg-cover bg-center md:h-full"
                        style={{ backgroundImage: `url(${room.imageUrls[0]})` }}
                        aria-hidden
                      />
                      <div className="p-4">
                        <Link
                          href={buildRoomRouteFromSlug(room.slug)}
                          className="text-[22px] font-extrabold text-[#0b5f89] hover:text-[#08719f] md:text-[24px]"
                        >
                          {room.title}
                        </Link>
                        <p className="mt-1 text-[16px] text-slate-500">{room.address}</p>
                        <p className="mt-2 text-[17px] text-slate-700">{room.subtitle}</p>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[14px]">
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-[#fff1f1] px-3 py-1 font-bold text-[#f2483a]">
                              {room.priceLabel}
                            </span>
                            <span className="rounded-full bg-[#ecf9ff] px-3 py-1 font-semibold text-[#0b7ea9]">
                              {room.areaLabel}
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                              {room.availableRoomsLabel}
                            </span>
                          </div>
                          
                          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 transition hover:bg-slate-50">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-[#0b7ea9]"
                              checked={selectedForCompare.some((r) => r.id === room.id)}
                              onChange={() => toggleCompare(room)}
                            />
                            <span className="font-semibold text-slate-700">So sánh</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              : null}

            {!loading && meta.total > meta.limit ? (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  type="button"
                  disabled={meta.page <= 1}
                  onClick={() => {
                    const newPage = String(meta.page - 1);
                    setFilters((prev) => ({ ...prev, page: newPage }));
                    const nextApplied = { ...appliedFilters, page: newPage };
                    setAppliedFilters(nextApplied);
                    router.replace(`/search?${buildQueryParams(nextApplied).toString()}`);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Trước
                </button>
                <span className="flex items-center px-4 font-semibold text-slate-700">
                  Trang {meta.page} / {Math.ceil(meta.total / meta.limit)}
                </span>
                <button
                  type="button"
                  disabled={meta.page >= Math.ceil(meta.total / meta.limit)}
                  onClick={() => {
                    const newPage = String(meta.page + 1);
                    setFilters((prev) => ({ ...prev, page: newPage }));
                    const nextApplied = { ...appliedFilters, page: newPage };
                    setAppliedFilters(nextApplied);
                    router.replace(`/search?${buildQueryParams(nextApplied).toString()}`);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </section>

      {/* Floating Compare Bar */}
      {selectedForCompare.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
          <div className="mx-auto flex max-w-400 items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-slate-700">
                Đã chọn {selectedForCompare.length}/3 phòng
              </span>
              <div className="hidden items-center gap-2 sm:flex">
                {selectedForCompare.map((room) => (
                  <div key={room.id} className="relative h-12 w-12 overflow-hidden rounded-lg border border-slate-200">
                    <img src={room.imageUrls[0]} alt={room.title} className="h-full w-full object-cover" />
                    <button
                      onClick={() => toggleCompare(room)}
                      className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center bg-black/50 text-white hover:bg-black/80"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearCompare}
                className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
              >
                Bỏ chọn
              </button>
              <button
                onClick={() => setIsCompareModalOpen(true)}
                disabled={selectedForCompare.length < 2}
                className="rounded-xl bg-[#0b7ea9] px-6 py-2 font-bold text-white hover:brightness-110 disabled:opacity-50"
              >
                So sánh ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {isCompareModalOpen && (
        <RoomCompareModal
          rooms={selectedForCompare}
          onClose={() => setIsCompareModalOpen(false)}
        />
      )}
    </main>
  );
}
