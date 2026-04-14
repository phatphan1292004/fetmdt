"use client";

import { useMemo, useState } from "react";

type CityId = "hcm" | "hn";

type DistrictCardData = {
  id: string;
  name: string;
  imageUrl: string;
  listingCountLabel: string;
};

type CityTabData = {
  id: CityId;
  label: string;
  headingCity: string;
  districts: readonly DistrictCardData[];
};

const CITY_TABS: readonly CityTabData[] = [
  {
    id: "hcm",
    label: "Hồ Chí Minh",
    headingCity: "Hồ Chí Minh",
    districts: [
      {
        id: "quan-1",
        name: "Quận 1",
        imageUrl:
          "https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=900&q=80",
        listingCountLabel: "99+",
      },
      {
        id: "quan-2",
        name: "Quận 2",
        imageUrl:
          "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=80",
        listingCountLabel: "99+",
      },
      {
        id: "quan-3",
        name: "Quận 3",
        imageUrl:
          "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=900&q=80",
        listingCountLabel: "99+",
      },
      {
        id: "quan-4",
        name: "Quận 4",
        imageUrl:
          "https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&w=900&q=80",
        listingCountLabel: "99+",
      },
      {
        id: "quan-5",
        name: "Quận 5",
        imageUrl:
          "https://images.unsplash.com/photo-1470123808288-1e59739e73f8?auto=format&fit=crop&w=900&q=80",
        listingCountLabel: "99+",
      },
      {
        id: "quan-6",
        name: "Quận 6",
        imageUrl:
          "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=900&q=80",
        listingCountLabel: "99+",
      },
      {
        id: "quan-7",
        name: "Quận 7",
        imageUrl:
          "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=80",
        listingCountLabel: "99+",
      },
      {
        id: "quan-8",
        name: "Quận 8",
        imageUrl:
          "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=80",
        listingCountLabel: "99+",
      },
      {
        id: "quan-9",
        name: "Quận 9",
        imageUrl:
          "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?auto=format&fit=crop&w=900&q=80",
        listingCountLabel: "99+",
      },
      {
        id: "quan-10",
        name: "Quận 10",
        imageUrl:
          "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=900&q=80",
        listingCountLabel: "99+",
      },
      {
        id: "quan-11",
        name: "Quận 11",
        imageUrl:
          "https://images.unsplash.com/photo-1461716834906-394c52fe6e68?auto=format&fit=crop&w=900&q=80",
        listingCountLabel: "99+",
      },
      {
        id: "quan-12",
        name: "Quận 12",
        imageUrl:
          "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80",
        listingCountLabel: "99+",
      },
      {
        id: "binh-tan",
        name: "Bình Tân",
        imageUrl:
          "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=80&sat=-25",
        listingCountLabel: "99+",
      },
      {
        id: "binh-thanh",
        name: "Bình Thạnh",
        imageUrl:
          "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?auto=format&fit=crop&w=900&q=80&sat=-10",
        listingCountLabel: "99+",
      },
      {
        id: "go-vap",
        name: "Gò Vấp",
        imageUrl:
          "https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&w=900&q=80&sat=-5",
        listingCountLabel: "99+",
      },
      {
        id: "phu-nhuan",
        name: "Phú Nhuận",
        imageUrl:
          "https://images.unsplash.com/photo-1470123808288-1e59739e73f8?auto=format&fit=crop&w=900&q=80&sat=-12",
        listingCountLabel: "99+",
      },
      {
        id: "tan-binh",
        name: "Tân Bình",
        imageUrl:
          "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=900&q=80&sat=6",
        listingCountLabel: "99+",
      },
      {
        id: "tan-phu",
        name: "Tân Phú",
        imageUrl:
          "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=80&sat=-20",
        listingCountLabel: "99+",
      },
    ],
  },
  {
    id: "hn",
    label: "Hà Nội",
    headingCity: "Hà Nội",
    districts: [
      {
        id: "ba-dinh",
        name: "Ba Đình",
        imageUrl:
          "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80",
        listingCountLabel: "99+",
      },
      {
        id: "cau-giay",
        name: "Cầu Giấy",
        imageUrl:
          "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=900&q=80&sat=-18",
        listingCountLabel: "99+",
      },
      {
        id: "dong-da",
        name: "Đống Đa",
        imageUrl:
          "https://images.unsplash.com/photo-1461716834906-394c52fe6e68?auto=format&fit=crop&w=900&q=80&sat=-14",
        listingCountLabel: "99+",
      },
      {
        id: "hai-ba-trung",
        name: "Hai Bà Trưng",
        imageUrl:
          "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80&sat=-10",
        listingCountLabel: "99+",
      },
      {
        id: "hoan-kiem",
        name: "Hoàn Kiếm",
        imageUrl:
          "https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=900&q=80&sat=-8",
        listingCountLabel: "99+",
      },
      {
        id: "hoang-mai",
        name: "Hoàng Mai",
        imageUrl:
          "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=900&q=80&sat=-12",
        listingCountLabel: "99+",
      },
      {
        id: "long-bien",
        name: "Long Biên",
        imageUrl:
          "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?auto=format&fit=crop&w=900&q=80&sat=-25",
        listingCountLabel: "99+",
      },
      {
        id: "nam-tu-liem",
        name: "Nam Từ Liêm",
        imageUrl:
          "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=900&q=80&sat=-22",
        listingCountLabel: "99+",
      },
      {
        id: "bac-tu-liem",
        name: "Bắc Từ Liêm",
        imageUrl:
          "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=80&sat=-15",
        listingCountLabel: "99+",
      },
      {
        id: "thanh-xuan",
        name: "Thanh Xuân",
        imageUrl:
          "https://images.unsplash.com/photo-1470123808288-1e59739e73f8?auto=format&fit=crop&w=900&q=80&sat=-30",
        listingCountLabel: "99+",
      },
      {
        id: "ha-dong",
        name: "Hà Đông",
        imageUrl:
          "https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&w=900&q=80&sat=-24",
        listingCountLabel: "99+",
      },
      {
        id: "tay-ho",
        name: "Tây Hồ",
        imageUrl:
          "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=80&sat=-16",
        listingCountLabel: "99+",
      },
    ],
  },
];

export function RentalByDistrictTabs() {
  const [activeCityId, setActiveCityId] = useState<CityId>(CITY_TABS[0].id);

  const activeTab = useMemo(
    () => CITY_TABS.find((cityTab) => cityTab.id === activeCityId) ?? CITY_TABS[0],
    [activeCityId],
  );

  return (
    <section className="bg-[#f3f5f7] py-14">
      <div className="mx-auto w-full max-w-400 px-4 lg:px-8">
        <div className="inline-flex items-center gap-3" role="tablist" aria-label="Chon thanh pho">
          {CITY_TABS.map((cityTab) => {
            const isActive = activeCityId === cityTab.id;

            return (
              <button
                key={cityTab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`district-tab-panel-${cityTab.id}`}
                className={`rounded-2xl border px-6 py-3 text-[16px] font-semibold transition-colors ${
                  isActive
                    ? "border-[#27c4cb] bg-[#27c4cb] text-white"
                    : "border-slate-300 bg-white text-slate-500 hover:border-[#27c4cb]/60 hover:text-[#0a6d97]"
                }`}
                onClick={() => setActiveCityId(cityTab.id)}
              >
                {cityTab.label}
              </button>
            );
          })}
        </div>

        <h2 className="mt-5 text-[30px] font-extrabold leading-tight text-[#045a84] md:text-[48px]">
          Phòng trọ cho thuê tại <span className="text-[#27c4cb]">{activeTab.headingCity}</span>
        </h2>

        <div
          id={`district-tab-panel-${activeTab.id}`}
          role="tabpanel"
          className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6"
        >
          {activeTab.districts.map((district) => (
            <article key={district.id} className="group relative overflow-hidden rounded-3xl">
              <div className="relative aspect-square bg-slate-300">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-105"
                  style={{ backgroundImage: `url(${district.imageUrl})` }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/15 to-transparent" />

                <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[15px] font-bold text-[#0a6d97]">
                  {district.listingCountLabel}
                </span>

                <p className="absolute bottom-3 left-3 max-w-[85%] text-[18px] font-extrabold leading-tight text-white md:text-[32px]">
                  {district.name}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}