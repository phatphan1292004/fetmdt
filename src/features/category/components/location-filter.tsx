"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { slugify } from "@/src/utils/slugify";

type LocationItem = {
  city: string;
  districts: string[];
};

type LocationFilterProps = {
  city: string;
  district: string;
  locations: LocationItem[];
  currentParams: Record<string, string | string[] | undefined>;
};

function buildHref(
  currentParams: Record<string, string | string[] | undefined>,
  updates: Record<string, string | undefined>,
) {
  const query = new URLSearchParams();

  Object.entries(currentParams).forEach(([key, value]) => {
    if (!value || key === "page") return;

    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
    } else {
      query.set(key, value);
    }
  });

  Object.entries(updates).forEach(([key, value]) => {
    query.delete(key);

    if (value) {
      if (key === "city" || key === "district") {
        query.set(key, slugify(value));
      } else {
        query.set(key, value);
      }
    }
  });

  query.set("page", "1");

  return `/category?${query.toString()}`;
}

export function LocationFilter({
  city,
  district,
  locations,
  currentParams,
}: LocationFilterProps) {
  const router = useRouter();
  const [openCityDropdown, setOpenCityDropdown] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenCityDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <article className="border-t border-slate-200/80 pt-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-[#045a84]">
          Khu vực
        </h3>
        {city && (
          <button
            type="button"
            onClick={() => {
              router.push(
                buildHref(currentParams, {
                  city: undefined,
                  district: undefined,
                }),
              );
              setOpenCityDropdown(null);
            }}
            className="text-xs font-semibold text-slate-400 hover:text-rose-500 hover:underline"
          >
            Tất cả khu vực
          </button>
        )}
      </div>

      <div ref={containerRef} className="mt-3 space-y-3">
        {locations.map((loc) => {
          const isCurrentCity = city === loc.city;
          const isDropdownOpen = openCityDropdown === loc.city;

          return (
            <div key={loc.city} className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenCityDropdown(isDropdownOpen ? null : loc.city)
                }
                className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  isCurrentCity
                    ? "bg-[#045a84] text-white shadow-sm hover:bg-[#034d70]"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>
                  {isCurrentCity && district
                    ? `${loc.city}: ${district}`
                    : loc.city}
                </span>
                <svg
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 right-0 z-50 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      router.push(
                        buildHref(currentParams, {
                          city: loc.city,
                          district: undefined,
                        }),
                      );
                      setOpenCityDropdown(null);
                    }}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm transition hover:bg-slate-50 ${
                      isCurrentCity && !district
                        ? "font-bold text-[#045a84] bg-slate-50"
                        : "text-slate-600"
                    }`}
                  >
                    Tất cả {loc.city}
                  </button>

                  {loc.districts.map((dist) => {
                    const isCurrentDistrict =
                      isCurrentCity && district === dist;
                    return (
                      <button
                        key={dist}
                        type="button"
                        onClick={() => {
                          router.push(
                            buildHref(currentParams, {
                              city: loc.city,
                              district: dist,
                            }),
                          );
                          setOpenCityDropdown(null);
                        }}
                        className={`w-full text-left rounded-lg px-3 py-2 text-sm transition hover:bg-slate-50 ${
                          isCurrentDistrict
                            ? "font-bold text-[#045a84] bg-slate-50"
                            : "text-slate-600"
                        }`}
                      >
                        {dist}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}
