import { headers } from "next/headers";
import { PostCard } from "@/src/features/post/components/post-card";
import type { RawNewestPostData } from "@/src/features/post/servers/get-home-data";

type CategoryPageProps = {
  searchParams: Promise<{
    city?: string;
    district?: string;
  }>;
};

type NewestPostsResponse = {
  success: boolean;
  data?: RawNewestPostData[];
};

async function resolveApiBaseUrl(): Promise<{ baseUrl: string; cookieHeader: string } | null> {
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

function includesNormalized(value: string, keyword: string): boolean {
  return value.toLowerCase().includes(keyword.toLowerCase());
}

function FilterSection({
  title,
  items,
  checkFirst = false,
}: {
  title: string;
  items: readonly string[];
  checkFirst?: boolean;
}) {
  return (
    <article className="border-t border-slate-200/80 pt-6 first:border-t-0 first:pt-0">
      <h3 className="text-[35px] font-extrabold leading-none text-[#045a84]">{title}</h3>
      <div className="mt-4 space-y-2.5">
        {items.map((item, index) => (
          <label
            key={item}
            className="group flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 text-[18px] text-slate-800 transition hover:bg-slate-50"
          >
            <input
              type="checkbox"
              defaultChecked={index === 0 && checkFirst}
              className="h-[18px] w-[18px] rounded-[4px] border-slate-400 accent-[#22c2c7]"
            />
            <span className="leading-snug">{item}</span>
          </label>
        ))}
      </div>
    </article>
  );
}

export default async function CategoryPage({ searchParams }: CategoryPageProps) {
  const params = await searchParams;
  const city = asText(params.city);
  const district = asText(params.district);
  const titleDistrict = district || "Khu vực";

  let posts: RawNewestPostData[] = [];

  try {
    const apiContext = await resolveApiBaseUrl();

    if (apiContext) {
      const response = await fetch(
        `${apiContext.baseUrl}/api/v1/posts?section=newest&limit=20`,
        {
          method: "GET",
          headers: {
            cookie: apiContext.cookieHeader,
          },
          cache: "no-store",
        }
      );

      if (response.ok) {
        const payload = (await response.json()) as NewestPostsResponse;
        if (payload.success && Array.isArray(payload.data)) {
          posts = payload.data;
        }
      }
    }
  } catch (error) {
    console.error("[CategoryPage] Failed to load posts", error);
  }

  const filteredPosts = posts.filter((post) => {
    const address = asText(post.address);
    const postCity = asText((post as { city?: string }).city);
    const textSource = `${address} ${postCity}`;

    const matchCity = city ? includesNormalized(textSource, city) : true;
    const matchDistrict = district ? includesNormalized(textSource, district) : true;

    return matchCity && matchDistrict;
  });

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
          Có <span className="font-semibold text-[#0ea5b4]">{filteredPosts.length}</span> phòng đang hiển thị
        </p>

        <div className="mt-6 grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-26">
            <div className="h-[calc(100vh-9.5rem)] overflow-y-auto rounded-[28px] border border-[#c8d8e3] bg-white/95 p-5 shadow-[0_18px_40px_rgba(4,90,132,0.12)] backdrop-blur-sm">
            <section>
              <h3 className="text-[35px] font-extrabold leading-none text-[#045a84]">Khoảng giá</h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[16px] text-slate-700">Từ</p>
                  <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[20px] font-semibold text-slate-700">0đ</div>
                </div>
                <div>
                  <p className="text-[16px] text-slate-700">Đến</p>
                  <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[20px] font-semibold text-slate-700">20.000.000đ</div>
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-[#22c2c7]/20">
                <div className="h-2 rounded-full bg-[linear-gradient(90deg,#22c2c7_0%,#13b6c0_100%)] shadow-[0_2px_8px_rgba(34,194,199,0.45)]" />
              </div>
              <div className="mt-4 space-y-2.5">
                {[
                  "Tất cả mức giá",
                  "Dưới 3 triệu",
                  "3 - 5 triệu",
                  "5 - 7 triệu",
                  "7 - 10 triệu",
                  "10 - 15 triệu",
                  "Trên 15 triệu",
                ].map((label, index) => (
                  <label
                    key={label}
                    className="group flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 text-[18px] text-slate-800 transition hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={index === 0}
                      className="h-[18px] w-[18px] rounded-[4px] border-slate-400 accent-[#22c2c7]"
                    />
                    <span className="leading-snug">{label}</span>
                  </label>
                ))}
              </div>
            </section>

            <div className="mt-6 space-y-6">
              <FilterSection title="Khu vực" items={["TP Hồ Chí Minh", "Hà Nội"]} checkFirst />
              <FilterSection title="Loại phòng" items={["Loại phòng", "1 phòng ngủ", "2 phòng ngủ", "3 phòng ngủ", "Studio", "Duplex"]} />
              <FilterSection title="Chính sách" items={["Nuôi thú cưng", "Giờ giấc tự do", "Thời gian thuê tối thiểu 3 tháng", "Chủ nhà không ở cùng"]} />
              <FilterSection
                title="Tiện ích chung"
                items={[
                  "Khu cầu thang chung (*)",
                  "Khu để xe (*)",
                  "Phòng (*)",
                  "Ô tô đỗ cửa",
                  "Camera an ninh",
                  "Khóa cổng thông minh",
                  "Bảo vệ 24/7",
                ]}
              />
              <FilterSection title="Nội thất" items={["Kệ tivi", "Giá giày dép", "Bàn làm việc", "Sofa", "Bàn ăn", "Tủ bếp trên", "Tủ bếp dưới"]} />
              <FilterSection title="Tiện nghi" items={["Ban công", "Cửa sổ", "Gác lửng", "Khóa phòng thông minh", "Báo cháy phòng", "Dọn vệ sinh phòng", "Tivi"]} />
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
          </div>
        </div>
      </section>
    </main>
  );
}
