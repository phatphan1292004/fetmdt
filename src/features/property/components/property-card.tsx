import Link from "next/link";
import { buildRoomRouteFromSlug } from "../../room/servers";
import type { PropertyCardData } from "../servers/get-home-data";

type PropertyCardProps = {
  property: PropertyCardData;
};

export function PropertyCard({ property }: PropertyCardProps) {
  const roomDetailHref = buildRoomRouteFromSlug(property.id);

  return (
    <article className="relative overflow-hidden rounded-[26px] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)] flex flex-col h-full">
      <Link
        href={roomDetailHref}
        className="absolute inset-0 z-10 rounded-[26px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b7ea9]"
        aria-label={`Xem chi tiết ${property.title}`}
      />

      <div className="relative h-60 shrink-0">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${property.imageUrl})` }} />
        <div className="absolute inset-0 bg-linear-to-t from-black/25 to-transparent" />

        <span className="absolute left-4 top-4 z-20 rounded-full bg-[#0b7ea9]/95 px-3 py-1 text-[12px] font-bold text-white">
          {property.category}
        </span>

        <div className="absolute bottom-4 left-4 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[13px] font-bold text-[#f5a225]">
          <span aria-hidden>★</span>
          {property.rating.toFixed(1)}
        </div>

        <button
          type="button"
          className="relative z-20 absolute bottom-4 right-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-500"
          aria-label="Lưu phòng"
        >
          ❤
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-[18px] font-bold leading-snug text-slate-700 line-clamp-2 min-h-[48px]" title={property.title}>
            {property.title}
          </h3>
          <p className="mt-1 text-[14px] text-slate-500 line-clamp-1" title={`${property.address}${property.city ? `, ${property.city}` : ""}`}>
            {property.address}
            {property.city ? `, ${property.city}` : ""}
          </p>

          <div className="my-3.5 h-px bg-slate-200" />

          <ul className="space-y-1.5 text-[14px] text-slate-600">
            {property.highlights.map((highlight) => (
              <li key={highlight} className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[#25c3c8]" aria-hidden />
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4">
          <p className="text-[15px] font-semibold italic text-[#f2483a]">{property.availableLabel}</p>
          <p className="mt-2 text-right text-[15px] text-slate-400">
            từ <span className="text-[22px] font-extrabold text-[#25c3c8]">{property.priceLabel}</span>
          </p>
        </div>
      </div>
    </article>
  );
}