"use client";

import { useRouter } from "next/navigation";

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
      query.set(key, value);
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

  const selectedLocation = locations.find((item) => item.city === city);

  return (
    <article className="border-t border-slate-200/80 pt-5">
      <h3 className="text-[26px] font-extrabold leading-none text-[#045a84]">
        Khu vực
      </h3>

      <div className="mt-3 space-y-3">
        <select
          value={city}
          onChange={(event) => {
            router.push(
              buildHref(currentParams, {
                city: event.target.value || undefined,
                district: undefined,
              }),
            );
          }}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Tất cả tỉnh/thành</option>

          {locations.map((item) => (
            <option key={item.city} value={item.city}>
              {item.city}
            </option>
          ))}
        </select>

        <select
          value={district}
          disabled={!city}
          onChange={(event) => {
            router.push(
              buildHref(currentParams, {
                district: event.target.value || undefined,
              }),
            );
          }}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          <option value="">Tất cả quận/huyện</option>

          {selectedLocation?.districts.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}
