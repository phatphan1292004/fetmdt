import type { PropertyCardData } from "../servers/get-home-data";
import { PropertyCard } from "./property-card";

type FeaturedPropertiesSectionProps = {
  properties: readonly PropertyCardData[];
};

export function FeaturedPropertiesSection({ properties }: FeaturedPropertiesSectionProps) {
  return (
    <section className="bg-[#f3f5f7] py-20">
      <div className="mx-auto w-full max-w-310 px-4 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-[58px] font-extrabold text-[#045a84]">Tòa nhà có phòng bán chạy</h2>
          <button type="button" className="hidden items-center gap-2 text-[30px] font-semibold text-[#0a6d97] md:inline-flex">
            Xem tất cả
            <span aria-hidden>›</span>
          </button>
        </div>

        <div className="relative">
          <button
            type="button"
            className="absolute -left-10 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-300 bg-white text-[#0b7fae] shadow-sm lg:inline-flex"
            aria-label="Xem trước"
          >
            ‹
          </button>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

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