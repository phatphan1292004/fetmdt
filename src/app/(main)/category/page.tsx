import { headers } from "next/headers";
import { PriceRangeFilter } from "@/src/features/category/components/price-range-filter";
import { PostCard } from "@/src/features/post/components/post-card";
import type { RawNewestPostData } from "@/src/features/post/servers/get-home-data";
import { connectDB } from "@/src/lib/mongoose";
import Location from "@/src/models/Location";
import { LocationFilter } from "@/src/features/category/components/location-filter";
type CategoryPageProps = {
  searchParams: Promise<{
    city?: string;
    district?: string;
    page?: string;
    priceRange?: string | string[];
    propertyType?: string;
    policies?: string | string[];
    buildingAmenities?: string | string[];
    furniture?: string | string[];
    roomAmenities?: string | string[];
  }>;
};

type RoomsSearchResponse = {
  success: boolean;
  data?: RawNewestPostData[];
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
};

async function resolveApiBaseUrl(): Promise<{
  baseUrl: string;
  cookieHeader: string;
} | null> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");

  if (!host) {
    return null;
  }

  const protocol =
    headerStore.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "development" ? "http" : "https");

  return {
    baseUrl: `${protocol}://${host}`,
    cookieHeader: headerStore.get("cookie") ?? "",
  };
}

function asText(value?: string): string {
  return typeof value === "string" ? value.trim() : "";
}
function asArray(value?: string | string[]): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function buildFilterHref(
  params: Awaited<CategoryPageProps["searchParams"]>,
  updates: Record<string, string | undefined>,
) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (!value || key === "page") return;

    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
    } else {
      query.set(key, value);
    }
  });

  Object.entries(updates).forEach(([key, value]) => {
    query.delete(key);
    if (value) query.set(key, value);
  });

  query.set("page", "1");

  return `/category?${query.toString()}`;
}

function toggleFilterHref(
  params: Awaited<CategoryPageProps["searchParams"]>,
  key: string,
  value: string,
) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([paramKey, paramValue]) => {
    if (!paramValue || paramKey === "page") return;

    if (Array.isArray(paramValue)) {
      paramValue.forEach((item) => query.append(paramKey, item));
    } else {
      query.set(paramKey, paramValue);
    }
  });

  const currentValues = query.getAll(key);
  query.delete(key);

  if (currentValues.includes(value)) {
    currentValues
      .filter((item) => item !== value)
      .forEach((item) => query.append(key, item));
  } else {
    [...currentValues, value].forEach((item) => query.append(key, item));
  }

  query.set("page", "1");

  return `/category?${query.toString()}`;
}
function asPage(value?: string): number {
  const page = Number(value);

  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return Math.floor(page);
}

function FilterSection({
  title,
  items,
  activeItems,
  filterKey,
  params,
}: {
  title: string;
  items: readonly { label: string; value: string }[];
  activeItems: string[];
  filterKey: string;
  params: Awaited<CategoryPageProps["searchParams"]>;
}) {
  return (
    <article className="border-t border-slate-200/80 pt-5 first:border-t-0 first:pt-0">
      <h3 className="text-[26px] font-extrabold leading-none text-[#045a84]">
        {title}
      </h3>

      <div className="mt-3 space-y-1.5">
        {items.map((item) => {
          const active = activeItems.includes(item.value);

          return (
            <a
              key={item.value}
              href={toggleFilterHref(params, filterKey, item.value)}
              className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[15px] text-slate-700 hover:bg-slate-50"
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded border text-xs font-bold ${
                  active
                    ? "border-[#22c2c7] bg-[#22c2c7] text-white"
                    : "border-slate-400 bg-white text-transparent"
                }`}
              >
                ✓
              </span>
              <span>{item.label}</span>
            </a>
          );
        })}
      </div>
    </article>
  );
}

export default async function CategoryPage({
  searchParams,
}: CategoryPageProps) {
  const params = await searchParams;
  const city = asText(params.city);
  const district = asText(params.district);
  const priceRanges = asArray(params.priceRange);
  const propertyType = asText(params.propertyType);
  const policies = asArray(params.policies);
  const buildingAmenities = asArray(params.buildingAmenities);
  const furniture = asArray(params.furniture);
  const roomAmenities = asArray(params.roomAmenities);
  const page = asPage(params.page);
  const limit = 5;
  const titleDistrict = district || "Khu vực";
  await connectDB();

  const locations = await Location.find({})
    .select("city districts -_id")
    .sort({ city: 1 })
    .lean();

  const plainLocations = locations.map((item) => ({
    city: item.city,
    districts: item.districts ?? [],
  }));

  let posts: RawNewestPostData[] = [];
  let total = 0;

  try {
    const apiContext = await resolveApiBaseUrl();

    if (apiContext) {
      const query = new URLSearchParams();

      if (city) query.set("city", city);
      if (district) query.set("district", district);
      if (propertyType) query.set("propertyType", propertyType);

      priceRanges.forEach((item) => query.append("priceRange", item));
      policies.forEach((item) => query.append("policies", item));
      buildingAmenities.forEach((item) =>
        query.append("buildingAmenities", item),
      );
      furniture.forEach((item) => query.append("furniture", item));
      roomAmenities.forEach((item) => query.append("roomAmenities", item));

      query.set("page", page.toString());
      query.set("limit", limit.toString());

      const response = await fetch(
        `${apiContext.baseUrl}/api/v1/rooms/search?${query.toString()}`,
        {
          method: "GET",
          headers: {
            cookie: apiContext.cookieHeader,
          },
          cache: "no-store",
        },
      );

      if (response.ok) {
        const payload = (await response.json()) as RoomsSearchResponse;

        if (payload.success && Array.isArray(payload.data)) {
          posts = payload.data;
          total = payload.meta?.total ?? payload.data.length;
        }
      }
    }
  } catch (error) {
    console.error("[CategoryPage] Failed to load posts", error);
  }

  const filteredPosts = posts;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <main className="bg-[#f3f5f7] py-8">
      <section className="mx-auto w-full max-w-350 px-4 lg:px-6">
        <p className="text-[14px] text-slate-500">
          Trang chủ <span className="mx-1">›</span>
          {city ? (
            <>
              <span>{city}</span> <span className="mx-1">›</span>
            </>
          ) : null}
          <span className="font-semibold text-slate-700">{titleDistrict}</span>
        </p>

        <h1 className="mt-2 text-[32px] font-extrabold leading-tight text-[#045a84]">
          Cho thuê phòng trọ {titleDistrict}
        </h1>

        <p className="mt-2 text-[18px] text-slate-600">
          Có <span className="font-semibold text-[#0ea5b4]">{total}</span> phòng
          đang hiển thị
        </p>

        <div className="mt-6 grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-26">
            <div className="h-[calc(150vh-9.5rem)] overflow-y-auto rounded-[28px] border border-[#c8d8e3] bg-white/95 p-5 shadow-[0_18px_40px_rgba(4,90,132,0.12)] backdrop-blur-sm">
              <section>
                <h3 className="text-[26px] font-extrabold leading-none text-[#045a84]">
                  Khoảng giá
                </h3>
                <PriceRangeFilter />
              </section>

              <div className="mt-6 space-y-6">
                <LocationFilter
                  city={city}
                  district={district}
                  locations={plainLocations}
                  currentParams={params}
                />
                <FilterSection
                  title="Chính sách"
                  activeItems={policies}
                  filterKey="policies"
                  params={params}
                  items={[
                    { label: "Nuôi thú cưng", value: "pet-friendly" },
                    { label: "Giờ giấc tự do", value: "free-hours" },
                    {
                      label: "Thời gian thuê tối thiểu 3 tháng",
                      value: "min-3-months",
                    },
                    { label: "Chủ nhà không ở cùng", value: "owner-not-live" },
                  ]}
                />
                <FilterSection
                  title="Tiện ích chung"
                  activeItems={buildingAmenities}
                  filterKey="buildingAmenities"
                  params={params}
                  items={[
                    { label: "Khu cầu thang chung", value: "shared-stair" },
                    { label: "Khu để xe", value: "parking" },
                    { label: "Phòng", value: "private-room" },
                    { label: "Ô tô đỗ cửa", value: "car-access" },
                    { label: "Camera an ninh", value: "security-camera" },
                    { label: "Khóa cổng thông minh", value: "smart-gate" },
                    { label: "Bảo vệ 24/7", value: "security-24-7" },
                  ]}
                />

                <FilterSection
                  title="Nội thất"
                  activeItems={furniture}
                  filterKey="furniture"
                  params={params}
                  items={[
                    { label: "Kệ tivi", value: "tv-shelf" },
                    { label: "Giá giày dép", value: "shoe-rack" },
                    { label: "Bàn làm việc", value: "desk" },
                    { label: "Sofa", value: "sofa" },
                    { label: "Bàn ăn", value: "dining-table" },
                    { label: "Tủ bếp trên", value: "upper-kitchen-cabinet" },
                    { label: "Tủ bếp dưới", value: "lower-kitchen-cabinet" },
                  ]}
                />

                <FilterSection
                  title="Tiện nghi"
                  activeItems={roomAmenities}
                  filterKey="roomAmenities"
                  params={params}
                  items={[
                    { label: "Ban công", value: "balcony" },
                    { label: "Cửa sổ", value: "window" },
                    { label: "Gác lửng", value: "loft" },
                    {
                      label: "Khóa phòng thông minh",
                      value: "smart-door-lock",
                    },
                    { label: "Báo cháy phòng", value: "fire-alarm" },
                    { label: "Dọn vệ sinh phòng", value: "room-cleaning" },
                    { label: "Tivi", value: "tv" },
                  ]}
                />
              </div>
            </div>
          </aside>

          <div className="space-y-5">
            {filteredPosts.length ? (
              filteredPosts.map((post, index) => (
                <PostCard
                  key={post.id ?? post._id ?? `category-post-${index}`}
                  post={post}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
                Chưa có phòng phù hợp với khu vực đã chọn.
              </div>
            )}
            {totalPages > 1 ? (
              <div className="flex w-full items-center justify-center gap-3 pt-6">
                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1;
                  const hrefParams = new URLSearchParams();

                  Object.entries(params).forEach(([key, value]) => {
                    if (!value || key === "page") return;

                    if (Array.isArray(value)) {
                      value.forEach((item) => hrefParams.append(key, item));
                    } else {
                      hrefParams.set(key, value);
                    }
                  });

                  hrefParams.set("page", pageNumber.toString());

                  return (
                    <a
                      key={pageNumber}
                      href={`/category?${hrefParams.toString()}`}
                      className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                        pageNumber === page
                          ? "border-[#045a84] bg-[#045a84] text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {pageNumber}
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
