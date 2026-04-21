"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { RoomDetailData } from "../types";

type RentalCategory = "Cho thuê" | "Phòng trọ";
type PriceFilter = "all" | "under-1" | "1-2" | "2-3" | "3-5" | "5-7" | "over-7";
type AreaFilter = "all" | "under-20" | "20-30" | "30-40" | "40-plus";
type FurnishedFilter = "all" | "full" | "basic";

type RoomListingPageProps = {
  districtLabel: string;
  rooms: readonly RoomDetailData[];
};

const REGION_OPTIONS = ["Tp Hồ Chí Minh", "Hà Nội", "Đà Nẵng"] as const;
type RegionOption = (typeof REGION_OPTIONS)[number];

const REGION_COORDINATES: Readonly<Record<RegionOption, { lat: number; lng: number; label: string }>> = {
  "Tp Hồ Chí Minh": { lat: 10.7769, lng: 106.7009, label: "Trung tâm TP Hồ Chí Minh" },
  "Hà Nội": { lat: 21.0285, lng: 105.8542, label: "Trung tâm Hà Nội" },
  "Đà Nẵng": { lat: 16.0544, lng: 108.2022, label: "Trung tâm Đà Nẵng" },
};

const NEAR_ME_OPTIONS: ReadonlyArray<{ label: string; region: RegionOption }> = [
  { label: "Quận 1, TP Hồ Chí Minh", region: "Tp Hồ Chí Minh" },
  { label: "Cầu Giấy, Hà Nội", region: "Hà Nội" },
  { label: "Hải Châu, Đà Nẵng", region: "Đà Nẵng" },
];

const PRICE_OPTIONS: readonly { id: PriceFilter; label: string }[] = [
  { id: "under-1", label: "Dưới 1 triệu" },
  { id: "1-2", label: "1 - 2 triệu" },
  { id: "2-3", label: "2 - 3 triệu" },
  { id: "3-5", label: "3 - 5 triệu" },
  { id: "5-7", label: "5 - 7 triệu" },
  { id: "over-7", label: "Trên 7 triệu" },
];

const SIDEBAR_PRICE_OPTIONS: readonly { id: PriceFilter; label: string }[] = [
  { id: "all", label: "Tất cả" },
  ...PRICE_OPTIONS,
];

function getPriceInMillion(value: string): number {
  const numbers = value.replace(/\./g, "").match(/\d+/);
  if (!numbers) {
    return 0;
  }

  return Number(numbers[0]) / 1_000_000;
}

function getAreaAverage(areaLabel: string): number {
  const numbers = areaLabel.match(/\d+/g)?.map(Number) ?? [];
  if (numbers.length === 0) {
    return 0;
  }

  if (numbers.length === 1) {
    return numbers[0];
  }

  return (numbers[0] + numbers[1]) / 2;
}

function matchPrice(price: number, filter: PriceFilter): boolean {
  if (filter === "all") {
    return true;
  }
  if (filter === "under-1") {
    return price < 1;
  }
  if (filter === "1-2") {
    return price >= 1 && price < 2;
  }
  if (filter === "2-3") {
    return price >= 2 && price < 3;
  }
  if (filter === "3-5") {
    return price >= 3 && price < 5;
  }
  if (filter === "5-7") {
    return price >= 5 && price < 7;
  }

  return price >= 7;
}

function matchArea(area: number, filter: AreaFilter): boolean {
  if (filter === "all") {
    return true;
  }
  if (filter === "under-20") {
    return area < 20;
  }
  if (filter === "20-30") {
    return area >= 20 && area < 30;
  }
  if (filter === "30-40") {
    return area >= 30 && area < 40;
  }

  return area >= 40;
}

function hasFullFurniture(room: RoomDetailData): boolean {
  return room.amenities.some((amenity) => {
    const label = typeof amenity === "string" ? amenity : amenity.name;
    return label.toLowerCase().includes("noi that day du");
  });
}

function getInitialRegion(districtLabel: string): RegionOption {
  return districtLabel.toLowerCase().includes("ha noi") ? "Hà Nội" : "Tp Hồ Chí Minh";
}

function getDistanceScore(latA: number, lngA: number, latB: number, lngB: number): number {
  const latDiff = latA - latB;
  const lngDiff = lngA - lngB;
  return latDiff * latDiff + lngDiff * lngDiff;
}

function getNearestRegion(lat: number, lng: number): RegionOption {
  return REGION_OPTIONS.reduce((closest, current) => {
    const closestCoord = REGION_COORDINATES[closest];
    const currentCoord = REGION_COORDINATES[current];
    const closestScore = getDistanceScore(lat, lng, closestCoord.lat, closestCoord.lng);
    const currentScore = getDistanceScore(lat, lng, currentCoord.lat, currentCoord.lng);
    return currentScore < closestScore ? current : closest;
  }, REGION_OPTIONS[0]);
}

function buildOpenStreetMapEmbedUrl(lat: number, lng: number): string {
  const lngOffset = 0.09;
  const latOffset = 0.06;
  const minLng = lng - lngOffset;
  const minLat = lat - latOffset;
  const maxLng = lng + lngOffset;
  const maxLat = lat + latOffset;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export function RoomListingPage({ districtLabel, rooms }: RoomListingPageProps) {
  const initialRegion = getInitialRegion(districtLabel);
  const [rentalCategory, setRentalCategory] = useState<RentalCategory>("Cho thuê");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [areaFilter, setAreaFilter] = useState<AreaFilter>("all");
  const [furnishedFilter, setFurnishedFilter] = useState<FurnishedFilter>("all");
  const [region, setRegion] = useState<RegionOption>(initialRegion);
  const [isNearMeOpen, setIsNearMeOpen] = useState(false);
  const [nearMeLabel, setNearMeLabel] = useState<string | null>(null);
  const [mapFocus, setMapFocus] = useState<{ lat: number; lng: number; label: string }>(REGION_COORDINATES[initialRegion]);
  const [isLocating, setIsLocating] = useState(false);
  const [nearMeError, setNearMeError] = useState<string | null>(null);

  const mapEmbedUrl = useMemo(() => {
    return buildOpenStreetMapEmbedUrl(mapFocus.lat, mapFocus.lng);
  }, [mapFocus.lat, mapFocus.lng]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const roomPrice = getPriceInMillion(room.priceLabel);
      const roomArea = getAreaAverage(room.areaLabel);
      const roomRegion = room.city.toLowerCase().includes("ha noi") ? "Hà Nội" : "Tp Hồ Chí Minh";
      const isFull = hasFullFurniture(room);

      const matchRegion = roomRegion === region;
      const matchFurniture =
        furnishedFilter === "all" || (furnishedFilter === "full" ? isFull : !isFull);

      return matchRegion && matchPrice(roomPrice, priceFilter) && matchArea(roomArea, areaFilter) && matchFurniture;
    });
  }, [areaFilter, furnishedFilter, priceFilter, region, rooms]);

  function clearAllFilters() {
    setRentalCategory("Cho thuê");
    setPriceFilter("all");
    setAreaFilter("all");
    setFurnishedFilter("all");
    setRegion(initialRegion);
    setNearMeLabel(null);
    setNearMeError(null);
    setMapFocus(REGION_COORDINATES[initialRegion]);
  }

  function handleChooseRegionFromMap(nextRegion: RegionOption, label: string) {
    setRegion(nextRegion);
    setNearMeLabel(label);
    setNearMeError(null);
    setMapFocus(REGION_COORDINATES[nextRegion]);
  }

  function handleUseCurrentLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setNearMeError("Trình duyệt chưa hỗ trợ định vị GPS.");
      return;
    }

    setIsLocating(true);
    setNearMeError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const nearestRegion = getNearestRegion(latitude, longitude);

        setRegion(nearestRegion);
        setNearMeLabel(`Vị trí hiện tại (${nearestRegion})`);
        setMapFocus({ lat: latitude, lng: longitude, label: "Vị trí của bạn" });
        setIsNearMeOpen(false);
        setIsLocating(false);
      },
      () => {
        setNearMeError("Không lấy được vị trí hiện tại. Hãy kiểm tra quyền truy cập vị trí.");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }

  return (
    <main className="flex-1 bg-[#f3f5f7] pb-14">
      <section className="mx-auto w-full max-w-400 px-4 pt-6 lg:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-[0_8px_26px_rgba(15,23,42,0.07)]">
          <p className="text-sm text-slate-500">
            Nhà Tốt <span className="mx-1">/</span>
            <span className="font-semibold text-slate-900">Thuê Phòng trọ</span>
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-4">
            <h1 className="text-[30px] font-extrabold leading-tight text-slate-900 md:text-[38px]">
              {filteredRooms.length.toLocaleString("vi-VN")} Phòng Trọ Cho Thuê Toàn Quốc Giá Tốt 04/2026
            </h1>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2 text-[16px] font-semibold text-slate-700"
            >
              Lưu tìm kiếm
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-[16px]">
            <button type="button" className="rounded-full bg-slate-100 px-4 py-1.5 font-semibold text-slate-700">
              Lọc
            </button>
            <button
              type="button"
              onClick={() => setRentalCategory("Cho thuê")}
              className={`rounded-full px-4 py-1.5 font-semibold ${
                rentalCategory === "Cho thuê" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              Cho thuê
            </button>
            <button
              type="button"
              onClick={() => setRentalCategory("Phòng trọ")}
              className={`rounded-full px-4 py-1.5 font-semibold ${
                rentalCategory === "Phòng trọ" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              Phòng trọ
            </button>
            <button type="button" className="rounded-full bg-slate-100 px-4 py-1.5 font-semibold text-slate-700">
              Giá thuê
            </button>
            <button type="button" className="rounded-full bg-slate-100 px-4 py-1.5 font-semibold text-slate-700">
              Diện tích
            </button>
            <button
              type="button"
              onClick={() => setFurnishedFilter((current) => (current === "all" ? "full" : "all"))}
              className={`rounded-full px-4 py-1.5 font-semibold ${
                furnishedFilter === "all" ? "bg-slate-100 text-slate-700" : "bg-slate-900 text-white"
              }`}
            >
              Tình trạng nội thất
            </button>
            <button
              type="button"
              onClick={clearAllFilters}
              className="ml-auto font-semibold text-slate-700 underline underline-offset-4"
            >
              Xóa lọc
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-[16px]">
            <span className="mr-1 font-medium text-slate-600">Khu vực:</span>
            <button
              type="button"
              onClick={() => setIsNearMeOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-slate-700 transition hover:bg-slate-50"
              aria-label="Chọn phòng gần tôi"
            >
              <svg className="h-4 w-4 text-[#0ea5e9]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" />
                <circle cx="12" cy="10" r="2.5" strokeWidth={2} />
              </svg>
              Gần tôi
            </button>
            {nearMeLabel ? (
              <span className="rounded-full bg-slate-900 px-3 py-1.5 text-white">
                {nearMeLabel}
              </span>
            ) : null}
            {REGION_OPTIONS.map((regionOption) => (
              <button
                key={regionOption}
                type="button"
                onClick={() => {
                  setRegion(regionOption);
                  setNearMeLabel(null);
                  setNearMeError(null);
                  setMapFocus(REGION_COORDINATES[regionOption]);
                }}
                className={`rounded-full border px-4 py-1.5 ${
                  regionOption === region
                    ? "border-slate-900 bg-slate-900 font-semibold text-white"
                    : "border-slate-300 bg-white text-slate-700"
                }`}
              >
                {regionOption}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[16px]">
            <span className="mr-1 font-medium text-slate-600">Giá thuê:</span>
            {PRICE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setPriceFilter(option.id)}
                className={`rounded-full border px-4 py-1.5 ${
                  priceFilter === option.id
                    ? "border-slate-900 bg-slate-900 font-semibold text-white"
                    : "border-slate-300 bg-white text-slate-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {isNearMeOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <p className="text-[22px] font-extrabold text-slate-900">Chọn phòng gần tôi</p>
                <button
                  type="button"
                  onClick={() => setIsNearMeOpen(false)}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                  aria-label="Đóng"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Chọn điểm trên bản đồ hoặc dùng GPS hiện tại để lọc phòng trọ gần bạn.
              </p>
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                <iframe
                  src={mapEmbedUrl}
                  title="Bản đồ khu vực"
                  className="h-64 w-full"
                  loading="lazy"
                />
              </div>
              <p className="mt-2 text-sm text-slate-500">Đang xem: {mapFocus.label}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {REGION_OPTIONS.map((regionOption) => (
                  <button
                    key={regionOption}
                    type="button"
                    onClick={() => handleChooseRegionFromMap(regionOption, `Chọn trên bản đồ (${regionOption})`)}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      regionOption === region
                        ? "border-slate-900 bg-slate-900 font-semibold text-white"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    {regionOption}
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {NEAR_ME_OPTIONS.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => {
                      handleChooseRegionFromMap(option.region, option.label);
                      setIsNearMeOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left text-[16px] text-slate-700 hover:bg-slate-50"
                  >
                    <span>{option.label}</span>
                    <span className="text-xs font-semibold text-slate-500">{option.region}</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="rounded-full bg-[#0b7ea9] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                >
                  {isLocating ? "Đang lấy vị trí..." : "Dùng vị trí hiện tại (GPS)"}
                </button>
                {nearMeError ? <span className="text-sm text-rose-600">{nearMeError}</span> : null}
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <button
                  type="button"
                  className="rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-700"
                  onClick={() => {
                    setNearMeLabel(null);
                    setIsNearMeOpen(false);
                  }}
                >
                  Bỏ chọn
                </button>
                <button
                  type="button"
                  className="rounded-full bg-slate-900 px-4 py-2 font-semibold text-white"
                  onClick={() => setIsNearMeOpen(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,2fr)_340px]">
          <div className="space-y-4">
            {filteredRooms.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-[16px] text-slate-600">
                Không có phòng phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              filteredRooms.map((room) => (
                <article
                  key={room.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
                >
                  <div className="grid md:grid-cols-[260px_1fr]">
                    <div
                      className="h-48 bg-cover bg-center md:h-full"
                      style={{ backgroundImage: `url(${room.imageUrls[0]})` }}
                      aria-hidden
                    />
                    <div className="p-4">
                      <Link
                        href={`/cho-thue-phong-tro-hn/${room.districtSlug}/${room.slug}`}
                        className="text-[22px] font-extrabold text-[#0b5f89] hover:text-[#08719f] md:text-[24px]"
                      >
                        {room.title}
                      </Link>
                      <p className="mt-1 text-[16px] text-slate-500">{room.address}</p>
                      <p className="mt-2 text-[17px] text-slate-700">{room.subtitle}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-[14px]">
                        <span className="rounded-full bg-[#fff1f1] px-3 py-1 font-bold text-[#f2483a]">{room.priceLabel}</span>
                        <span className="rounded-full bg-[#ecf9ff] px-3 py-1 font-semibold text-[#0b7ea9]">{room.areaLabel}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{room.availableRoomsLabel}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <aside className="space-y-4">
            <article className="rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
              <h2 className="text-[24px] font-extrabold text-slate-900">Lọc theo khoảng giá</h2>
              <div className="mt-2 space-y-2 text-[16px]">
                {SIDEBAR_PRICE_OPTIONS.map((priceOption) => {
                  const isActive = priceFilter === priceOption.id;

                  return (
                    <button
                      key={priceOption.id}
                      type="button"
                      onClick={() => setPriceFilter(priceOption.id)}
                      className={`w-full rounded-lg border px-3 py-2 text-left ${
                        isActive
                          ? "border-[#0b7ea9] bg-[#effaff] font-semibold text-[#0b7ea9]"
                          : "border-slate-200 text-slate-700"
                      }`}
                    >
                      {priceOption.label}
                    </button>
                  );
                })}
              </div>
            </article>

            <article className="rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
              <h2 className="text-[24px] font-extrabold text-slate-900">Lọc theo diện tích</h2>
              <div className="mt-2 space-y-2 text-[16px]">
                {["all", "under-20", "20-30", "30-40", "40-plus"].map((areaOption) => {
                  const labelMap: Record<string, string> = {
                    all: "Tất cả",
                    "under-20": "Dưới 20 m2",
                    "20-30": "20 - 30 m2",
                    "30-40": "30 - 40 m2",
                    "40-plus": "Trên 40 m2",
                  };
                  const isActive = areaFilter === areaOption;

                  return (
                    <button
                      key={areaOption}
                      type="button"
                      onClick={() => setAreaFilter(areaOption as AreaFilter)}
                      className={`w-full rounded-lg border px-3 py-2 text-left ${
                        isActive ? "border-[#0b7ea9] bg-[#effaff] font-semibold text-[#0b7ea9]" : "border-slate-200 text-slate-700"
                      }`}
                    >
                      {labelMap[areaOption]}
                    </button>
                  );
                })}
              </div>
            </article>

            <article className="rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
              <h2 className="text-[24px] font-extrabold text-slate-900">Lọc theo tình trạng nội thất</h2>
              <div className="mt-2 space-y-2 text-[16px]">
                {[
                  { id: "all", label: "Tất cả" },
                  { id: "full", label: "Nội thất đầy đủ" },
                  { id: "basic", label: "Nội thất cơ bản" },
                ].map((furniture) => {
                  const isActive = furnishedFilter === furniture.id;

                  return (
                    <button
                      key={furniture.id}
                      type="button"
                      onClick={() => setFurnishedFilter(furniture.id as FurnishedFilter)}
                      className={`w-full rounded-lg border px-3 py-2 text-left ${
                        isActive ? "border-[#0b7ea9] bg-[#effaff] font-semibold text-[#0b7ea9]" : "border-slate-200 text-slate-700"
                      }`}
                    >
                      {furniture.label}
                    </button>
                  );
                })}
              </div>
            </article>
          </aside>
        </section>
      </section>
    </main>
  );
}
