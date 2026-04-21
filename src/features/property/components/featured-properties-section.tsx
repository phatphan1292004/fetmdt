"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PropertyCardData } from "../servers/get-home-data";
import { PropertyCard } from "./property-card";

type FeaturedPropertiesSectionProps = {
  properties: readonly PropertyCardData[];
};

export function FeaturedPropertiesSection({ properties }: FeaturedPropertiesSectionProps) {
  const categories = useMemo(
    () => ["Tất cả", ...new Set(properties.map((property) => property.category))] as const,
    [properties],
  );
  const [activeCategory, setActiveCategory] = useState<string>("Tất cả");

  const filteredProperties = useMemo(() => {
    if (activeCategory === "Tất cả") {
      return properties;
    }

    return properties.filter((property) => property.category === activeCategory);
  }, [activeCategory, properties]);

  return (
    <section className="bg-[#f3f5f7] py-20">
      <div className="mx-auto w-full max-w-400 px-4 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-[30px] font-extrabold text-[#045a84] md:text-[36px]">Tòa nhà có phòng bán chạy</h2>
          <Link
            href="/cho-thue-phong-tro-hn/quan-cau-giay/cho-thue-phong-tro"
            className="hidden items-center gap-2 text-[18px] font-semibold text-[#0a6d97] md:inline-flex"
          >
            Xem tất cả
            <span aria-hidden>›</span>
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = activeCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-[#0b7ea9] bg-[#0b7ea9] text-white"
                    : "border-slate-300 bg-white text-slate-600 hover:border-[#0b7ea9]/45 hover:text-[#0b7ea9]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <button
            type="button"
            className="absolute -left-10 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-300 bg-white text-[#0b7fae] shadow-sm lg:inline-flex"
            aria-label="Xem trước"
          >
            ‹
          </button>

          {filteredProperties.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
              Chưa có phòng phù hợp với category này.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          <button
            type="button"
            className="absolute -right-10 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-300 bg-white text-[#0b7fae] shadow-sm lg:inline-flex"
            aria-label="Xem tiếp"
          >
            ›
          </button>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          <span className="h-1.5 w-8 rounded-full bg-[#25c3c8]" />
          <span className="h-1.5 w-8 rounded-full bg-slate-300" />
        </div>
      </div>
    </section>
  );
}