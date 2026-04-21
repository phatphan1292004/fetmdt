"use client";

import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps", loop: false });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedSnap, setSelectedSnap] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  const filteredProperties = useMemo(() => {
    if (activeCategory === "Tất cả") {
      return properties;
    }

    return properties.filter((property) => property.category === activeCategory);
  }, [activeCategory, properties]);

  const syncSliderState = useCallback(() => {
    if (!emblaApi) {
      return;
    }

    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedSnap(emblaApi.selectedScrollSnap());
    setSnapCount(emblaApi.scrollSnapList().length);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    emblaApi.on("select", syncSliderState);
    emblaApi.on("reInit", syncSliderState);

    return () => {
      emblaApi.off("select", syncSliderState);
      emblaApi.off("reInit", syncSliderState);
    };
  }, [emblaApi, syncSliderState]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    emblaApi.reInit();
    emblaApi.scrollTo(0, true);
  }, [emblaApi, filteredProperties.length]);

  return (
    <section className="bg-[#f3f5f7] py-20">
      <div className="mx-auto w-full max-w-350 px-4 lg:px-8">
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
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            className={`absolute -left-14 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border bg-white text-[#0b7fae] shadow-sm transition lg:inline-flex ${
              canScrollPrev
                ? "border-slate-300 hover:border-[#0b7ea9]/45 hover:text-[#0b7ea9]"
                : "cursor-not-allowed border-slate-200 text-slate-300"
            }`}
            aria-label="Xem trước"
          >
            ‹
          </button>

          {filteredProperties.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
              Chưa có phòng phù hợp với category này.
            </div>
          ) : (
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="-ml-3 flex touch-pan-y md:-ml-4">
                {filteredProperties.map((property) => (
                  <div key={property.id} className="min-w-0 flex-[0_0_100%] pl-3 md:flex-[0_0_50%] md:pl-4 xl:flex-[0_0_25%]">
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            className={`absolute -right-12 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border bg-white text-[#0b7fae] shadow-sm transition lg:inline-flex ${
              canScrollNext
                ? "border-slate-300 hover:border-[#0b7ea9]/45 hover:text-[#0b7ea9]"
                : "cursor-not-allowed border-slate-200 text-slate-300"
            }`}
            aria-label="Xem tiếp"
          >
            ›
          </button>
        </div>

        {snapCount > 1 ? (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: snapCount }, (_, index) => {
              const isActive = index === selectedSnap;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => emblaApi?.scrollTo(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    isActive ? "w-8 bg-[#25c3c8]" : "w-4 bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Chuyển đến slide ${index + 1}`}
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}