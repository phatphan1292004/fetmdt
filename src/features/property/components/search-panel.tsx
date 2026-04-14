"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SearchPanelProps = {
  searchPlaceholder: string;
  priceOptions: readonly string[];
  areaOptions: readonly string[];
  roomTypeOptions: readonly string[];
};

type MenuKey = "location" | "price" | "area" | "roomType";

const LOCATION_FIELDS = ["Tỉnh/ Thành phố", "Quận/Huyện", "Phường/Xã", "Đường/Phố"];

const BASE_CHECKBOX_CLASS = "h-5 w-5 accent-[#2cc3c8]";

export function SearchPanel({
  searchPlaceholder,
  priceOptions,
  areaOptions,
  roomTypeOptions,
}: SearchPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null);
  const [keyword, setKeyword] = useState("");
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState(roomTypeOptions[0] ?? "Tất cả");

  useEffect(() => {
    function handleClickOutside(event: PointerEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }

    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

  const priceLabel = useMemo(
    () => (selectedPrices.length ? `${selectedPrices.length} mức giá` : "Giá phòng"),
    [selectedPrices],
  );

  const areaLabel = useMemo(
    () => (selectedAreas.length ? `${selectedAreas.length} diện tích` : "Diện tích"),
    [selectedAreas],
  );

  function toggleFromList(value: string, selected: string[], onChange: (next: string[]) => void) {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
      return;
    }

    onChange([...selected, value]);
  }

  function resetFilters() {
    setKeyword("");
    setSelectedPrices([]);
    setSelectedAreas([]);
    setSelectedRoomType(roomTypeOptions[0] ?? "Tất cả");
    setActiveMenu(null);
  }

  function renderHeader(title: string) {
    return (
      <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
        <h3 className="text-[19px] font-bold text-[#045a84]">{title}</h3>
        <button
          type="button"
          onClick={() => setActiveMenu(null)}
          className="text-2xl leading-none text-[#0f6f98] transition hover:text-[#0a5f85]"
          aria-label="Đóng bộ lọc"
        >
          ×
        </button>
      </div>
    );
  }

  function renderLocationMenu() {
    return (
      <div className="w-[min(92vw,320px)] rounded-2xl bg-white p-4 shadow-2xl">
        {renderHeader("Khu vực")}
        <div className="space-y-2">
          {LOCATION_FIELDS.map((field) => (
            <button
              key={field}
              type="button"
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-[16px] text-slate-700"
            >
              {field}
              <span className="text-slate-400">›</span>
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button type="button" onClick={resetFilters} className="text-[16px] font-semibold text-[#087cb2] underline">
            Đặt lại
          </button>
          <button
            type="button"
            className="rounded-xl bg-[#075b86] px-5 py-2.5 text-[16px] font-semibold text-white transition hover:bg-[#04425f]"
          >
            Tìm kiếm
          </button>
        </div>
      </div>
    );
  }

  function renderRangeMenu(
    title: string,
    options: readonly string[],
    selected: string[],
    onChange: (next: string[]) => void,
    minLabel: string,
    maxLabel: string,
  ) {
    return (
      <div className="w-[min(92vw,370px)] rounded-2xl bg-white p-4 shadow-2xl">
        {renderHeader(title)}

        <div className="space-y-3 border-b border-slate-200 pb-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-slate-100 px-3 py-2 text-[16px] text-slate-500">{minLabel}</div>
            <div className="rounded-lg bg-slate-100 px-3 py-2 text-[16px] text-slate-500">{maxLabel}</div>
          </div>

          <div className="relative h-2 rounded-full bg-[#95e8eb]">
            <span className="absolute -left-1 -top-1 h-4 w-4 rounded-full bg-[#24c1c6]" />
            <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-[#24c1c6]" />
          </div>
        </div>

        <div className="mt-4 space-y-3 text-[16px] text-slate-700">
          <label className="flex items-center justify-between gap-2">
            <span>Tất cả mức {title.toLowerCase().replace(" ", "")}</span>
            <input
              type="checkbox"
              className={BASE_CHECKBOX_CLASS}
              checked={selected.length === 0}
              onChange={() => onChange([])}
            />
          </label>

          {options.map((option) => (
            <label key={option} className="flex items-center justify-between gap-2">
              <span>{option}</span>
              <input
                type="checkbox"
                className={BASE_CHECKBOX_CLASS}
                checked={selected.includes(option)}
                onChange={() => toggleFromList(option, selected, onChange)}
              />
            </label>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
          <button type="button" onClick={resetFilters} className="text-[16px] font-semibold text-[#087cb2] underline">
            Đặt lại
          </button>
          <button
            type="button"
            className="rounded-xl bg-[#075b86] px-5 py-2.5 text-[16px] font-semibold text-white transition hover:bg-[#04425f]"
          >
            Tìm kiếm
          </button>
        </div>
      </div>
    );
  }

  function renderRoomTypeMenu() {
    return (
      <div className="w-[min(90vw,250px)] rounded-2xl bg-white p-3 shadow-2xl">
        {renderHeader("Loại phòng")}
        <div className="space-y-1 text-[17px]">
          {roomTypeOptions.map((roomType) => {
            const isActive = selectedRoomType === roomType;
            return (
              <button
                key={roomType}
                type="button"
                onClick={() => {
                  setSelectedRoomType(roomType);
                  setActiveMenu(null);
                }}
                className={`w-full rounded-lg px-3 py-2 text-left transition ${
                  isActive ? "bg-[#e7fbfc] font-semibold text-[#087cb2]" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {roomType}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function renderMenu(menu: MenuKey) {
    if (menu === "location") {
      return renderLocationMenu();
    }

    if (menu === "price") {
      return renderRangeMenu("Giá phòng", priceOptions, selectedPrices, setSelectedPrices, "0đ", "20.000.000đ");
    }

    if (menu === "area") {
      return renderRangeMenu("Diện tích", areaOptions, selectedAreas, setSelectedAreas, "0m2", "100m2");
    }

    return renderRoomTypeMenu();
  }

  const filters: ReadonlyArray<{ key: MenuKey; label: string }> = [
    { key: "location", label: "Toàn quốc" },
    { key: "price", label: priceLabel },
    { key: "area", label: areaLabel },
    { key: "roomType", label: selectedRoomType },
  ];

  return (
    <div ref={panelRef} className="rounded-[28px] bg-[#25c3c8] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.28)] md:p-4">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-12 w-full rounded-2xl border-0 bg-white px-5 pr-14 text-[18px] text-slate-700 outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl bg-[#25c3c8] text-white"
              aria-label="Tìm kiếm"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
                <path d="M13.5 13.5L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <button
            type="button"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#005b8a] px-6 text-[24px] font-semibold text-white"
          >
            <svg className="h-5 w-5" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M2 4L6.5 2V16L2 14V4Z" fill="currentColor" />
              <path d="M7 2L11 4V14L7 16V2Z" fill="currentColor" opacity="0.8" />
              <path d="M11.5 4L16 2V14L11.5 16V4Z" fill="currentColor" opacity="0.65" />
            </svg>
            Bản đồ
          </button>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="grid flex-1 grid-cols-2 gap-2 rounded-2xl bg-white p-2 md:grid-cols-4 md:gap-0 md:p-1">
            {filters.map((filter, index) => {
              const isOpen = activeMenu === filter.key;

              return (
                <div key={filter.key} className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveMenu(isOpen ? null : filter.key)}
                    className={`flex h-12 w-full items-center justify-between rounded-xl px-4 text-left text-[18px] font-medium text-slate-700 transition hover:bg-slate-100 ${
                      index > 0 ? "md:border-l md:border-slate-200" : ""
                    } ${isOpen ? "bg-slate-100" : ""}`}
                  >
                    <span className="truncate">{filter.label}</span>
                    <span className="text-slate-400">▾</span>
                  </button>

                  {isOpen ? <div className="absolute left-0 top-full z-40 mt-2">{renderMenu(filter.key)}</div> : null}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="self-start text-[20px] font-semibold text-white underline decoration-white/80 underline-offset-2 transition hover:text-[#e7fdff]"
          >
            Đặt lại
          </button>
        </div>
      </div>
    </div>
  );
}