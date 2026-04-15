import Link from "next/link";
import type { AmenityData, AmenitySlug, RoomDetailData } from "../types";
import { AMENITY_MAP } from "../constants/amenity-icons";

type RoomDetailPageProps = {
  room: RoomDetailData;
  relatedRooms: readonly RoomDetailData[];
};

function GalleryTile({ imageUrl, className }: { imageUrl: string; className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl bg-slate-200 bg-cover bg-center ${className ?? ""}`}
      style={{ backgroundImage: `url(${imageUrl})` }}
      aria-hidden
    />
  );
}

const iconClassName = "h-4 w-4 text-[#25c3c8]";

const AMENITY_LABEL_TO_SLUG: Readonly<Record<string, AmenitySlug>> = {
  "Noi that day du": "furnished",
  "May giat chung": "washing-machine",
  "May giat": "washing-machine",
  "Thang may": "elevator",
  "Khoa van tay": "fingerprint-lock",
  "Giu xe": "parking",
  "Internet toc do cao": "wifi",
  "Dieu hoa": "air-conditioner",
  "Binh nong lanh": "water-heater",
  "Bep rieng": "kitchen",
  Wifi: "wifi",
};

function AmenityIcon({ slug }: { slug: AmenitySlug }) {
  return (
    AMENITY_MAP[slug] ?? (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClassName}>
        <path d="M20 6L9 17l-5-5" />
      </svg>
    )
  );
}

function normalizeAmenity(amenity: AmenityData | string, index: number): AmenityData {
  if (typeof amenity !== "string") {
    return amenity;
  }

  return {
    id: `amenity-${index}`,
    name: amenity,
    slug: AMENITY_LABEL_TO_SLUG[amenity] ?? "security",
  };
}

export function RoomDetailPage({ room, relatedRooms }: RoomDetailPageProps) {
  const gallery = [...room.imageUrls];

  while (gallery.length < 5) {
    gallery.push(room.imageUrls[0]);
  }

  return (
    <main className="flex-1 bg-[#f3f5f7] pb-16">
      <section className="mx-auto w-full max-w-400 px-4 pt-8 lg:px-8">
        <nav className="mb-4 text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-[#0b7ea9]">
                Trang chủ
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <span>Cho thue phong tro Ha Noi</span>
            </li>
            <li aria-hidden>/</li>
            <li>
              <span className="text-slate-700">{room.title}</span>
            </li>
          </ol>
        </nav>

        <section className="mb-7 grid grid-cols-1 gap-3 md:grid-cols-12">
          <GalleryTile imageUrl={gallery[0]} className="h-70 md:col-span-7 md:h-[450px]" />
          <div className="grid grid-cols-2 gap-3 md:col-span-5 md:grid-rows-2">
            <GalleryTile imageUrl={gallery[1]} className="h-33 md:h-full" />
            <GalleryTile imageUrl={gallery[2]} className="h-33 md:h-full" />
            <GalleryTile imageUrl={gallery[3]} className="h-33 md:h-full" />
            <div className="relative">
              <GalleryTile imageUrl={gallery[4]} className="h-33 md:h-full" />
              <button
                type="button"
                className="absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1 text-sm font-semibold text-white"
              >
                +{Math.max(room.imageUrls.length - 5, 0)} anh
              </button>
            </div>
          </div>
        </section>

        <header className="mb-6 rounded-3xl bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.08)] md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-4xl">
              <h1 className="text-[24px] font-extrabold leading-tight text-[#0b5f89] md:text-[42px]">{room.title}</h1>

              <div className="mt-3.5 flex items-center gap-3 text-[18px] text-slate-700 md:text-[30px]">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#25c3c8] text-white">•</span>
                <p className="text-[17px] leading-6 md:text-[18px]">{room.address}, {room.city}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[16px] text-slate-700 md:text-[22px]">
                <p>
                  Diện tích <span className="font-semibold text-[#25c3c8]">{room.areaLabel}</span>
                </p>
                <p>
                  Trạng thái <span className="font-semibold text-[#25c3c8]">{room.availableRoomsLabel}</span>
                </p>
                <p>
                  Giá thuê <span className="font-semibold text-[#f2483a]">{room.priceLabel}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[16px] text-slate-500 md:text-[22px]">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium transition hover:border-[#8cd7db] hover:text-[#0b7ea9]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M8 12h8" strokeLinecap="round" />
                  <path d="M12 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 12a8 8 0 1 1-2.3-5.7" strokeLinecap="round" />
                </svg>
                Chia sẻ
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium transition hover:border-[#8cd7db] hover:text-[#0b7ea9]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M12.1 20.3l-1.1-1C6 15 3 12.3 3 8.9 3 6.1 5.1 4 7.9 4c1.6 0 3.1.8 4.1 2.1C13 4.8 14.5 4 16.1 4 18.9 4 21 6.1 21 8.9c0 3.4-3 6.1-8 10.4l-.9 1z" />
                </svg>
                Lưu
              </button>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5 text-slate-700">
            <p className="text-[17px] leading-7 md:text-[25px]">{room.description}</p>

            <h2 className="mt-4 text-[21px] font-extrabold text-slate-800 md:text-[28px]">Vị trí - Trung tâm dễ dàng kết nối</h2>
            <ul className="mt-3 space-y-2 text-[16px] leading-7 text-slate-700 md:text-[25px]">
              {room.location.nearbyPlaces.map((place) => (
                <li key={place} className="flex items-start gap-3">
                  <span className="mt-3 inline-block h-2.5 w-2.5 rounded-full bg-slate-500" aria-hidden />
                  <span>{place}</span>
                </li>
              ))}
            </ul>

            <button type="button" className="mt-4 text-[17px] font-semibold text-[#1ab9be] underline underline-offset-4 md:text-[27px]">
              Xem thêm
            </button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <div className="space-y-6">
            <article className="rounded-3xl bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] md:p-7">
              <h2 className="text-[24px] font-extrabold text-[#0b5f89] md:text-[34px]">Phí dịch vụ chung</h2>
              <div className="mt-4 rounded-3xl bg-[#f6f6f6] p-5 md:p-7">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf9fa] text-[#25c3c8]">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                        <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-[16px] font-medium text-slate-700 md:text-[18px]">Tiền điện</p>
                      <p className="text-[15px] text-[#25c3c8] md:text-[17px]">{room.electricityPriceLabel}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf9fa] text-[#25c3c8]">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                        <path d="M12 2s6 6.2 6 11a6 6 0 1 1-12 0c0-4.8 6-11 6-11Z" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-[16px] font-medium text-slate-700 md:text-[18px]">Tiền nước</p>
                      <p className="text-[15px] text-[#25c3c8] md:text-[17px]">{room.waterPriceLabel}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf9fa] text-[#25c3c8]">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                        <path d="M11 2h2l1 7h4l-6 13-1-8H7l4-12Z" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-[16px] font-medium text-slate-700 md:text-[18px]">Đặt cọc</p>
                      <p className="text-[15px] text-[#25c3c8] md:text-[17px]">{room.depositLabel}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf9fa] text-[#25c3c8]">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                        <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-[16px] font-medium text-slate-700 md:text-[18px]">Diện tích</p>
                      <p className="text-[15px] text-[#25c3c8] md:text-[17px]">{room.areaLabel}</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-3xl bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] md:p-7">
              <h2 className="text-[24px] font-extrabold text-[#0b5f89] md:text-[34px]">Tiện ích chung</h2>
              <div className="mt-4 rounded-3xl bg-[#f6f6f6] p-5 md:p-7">
                <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                  {room.amenities.map((amenity, index) => {
                    const normalizedAmenity = normalizeAmenity(amenity, index);

                    return (
                      <div key={normalizedAmenity.id} className="flex items-start gap-3 text-[16px] text-slate-700 md:text-[20px]">
                      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white shadow-sm">
                        <AmenityIcon slug={normalizedAmenity.slug} />
                      </span>
                      <span className="leading-6">{normalizedAmenity.name}</span>
                    </div>
                    );
                  })}
                </div>
              </div>
            </article>

            <article className="rounded-3xl bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] md:p-7">
              <h2 className="text-[24px] font-extrabold text-[#0b5f89] md:text-[34px]">Nội quy</h2>
              <div className="mt-4 rounded-3xl bg-[#f6f6f6] p-5 md:p-7">
                <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-2">
                  {room.rules.map((rule) => (
                    <div key={rule} className="flex items-start gap-3 text-[16px] text-slate-700 md:text-[20px]">
                      <span className="mt-2 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-[#25c3c8]" aria-hidden />
                      <span className="leading-6">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>

          </div>

          <aside className="space-y-6">
            <article className="rounded-3xl bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.1)] md:p-6">
              <h2 className="text-[22px] font-extrabold text-slate-800">Liên hệ chủ phòng</h2>
              <div className="mt-4 flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${room.contact.avatarUrl})` }}
                  aria-hidden
                />
                <div>
                  <p className="font-semibold text-slate-800">{room.contact.name}</p>
                  <p className="text-sm text-slate-500">{room.contact.responseTime}</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <a
                  href={`tel:${room.contact.phone.replace(/\./g, "")}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#0b7ea9] px-4 py-3 text-base font-semibold text-white transition hover:bg-[#0a7198]"
                >
                  Gọi ngay {room.contact.phone}
                </a>
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-[#0b7ea9] px-4 py-3 text-base font-semibold text-[#0b7ea9] transition hover:bg-[#effaff]"
                >
                  Nhắn tin Zalo
                </button>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-300 bg-[#f4f6f8] p-3 shadow-[0_8px_20px_rgba(15,23,42,0.06)] md:p-4">
              <h2 className="text-[22px] font-extrabold text-[#0b5f89]">Đánh giá</h2>
              <div className="mx-auto mt-3 grid max-w-[300px] grid-cols-2 items-center">
                <div className="pr-4 text-center">
                  <p className="text-[28px] font-black leading-none text-slate-800">8,8</p>
                  <p className="mt-1 text-[15px] tracking-wide text-[#f59e0b]">★ ★ ★ ★ ★</p>
                </div>

                <div className="border-l border-slate-300 pl-4 text-center">
                  <p className="text-[24px] font-black leading-none text-slate-800">102</p>
                  <p className="text-sm text-slate-600">Đánh giá</p>
                </div>
              </div>
            </article>

            <article className="rounded-3xl bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)] md:p-5">
              <h2 className="text-[22px] font-extrabold text-slate-800">Phòng liên quan</h2>
              <div className="mt-3 space-y-3">
                {relatedRooms.map((item) => (
                  <Link
                    key={item.id}
                    href={`/cho-thue-phong-tro-hn/${item.districtSlug}/${item.slug}`}
                    className="block rounded-2xl border border-slate-200 p-3 transition hover:border-[#7ed9dd] hover:bg-[#f6fdff]"
                  >
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.address}</p>
                    <p className="mt-2 text-base font-extrabold text-[#f2483a]">{item.priceLabel}</p>
                  </Link>
                ))}
              </div>
            </article>
          </aside>

          <article className="rounded-3xl bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] md:p-7 lg:col-span-2">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-[24px] font-extrabold text-[#0b5f89] md:text-[34px]">Vi tri</h2>
                    <p className="mt-1 text-[15px] text-slate-600">{room.location.districtLabel}</p>
                  </div>

                  <span className="rounded-full bg-[#ecfeff] px-4 py-2 text-[13px] font-semibold text-[#0b7ea9]">
                    {room.location.mapLabel}
                  </span>
                </div>

                <div className="mt-5 rounded-3xl bg-[#f6f6f6] p-5 md:p-7">
                  <div className="mb-4 text-[16px] font-semibold text-slate-800 md:text-[18px]">Chọn khu vực lân cận</div>
                  <ul className="space-y-3">
                    {room.location.nearbyPlaces.map((place) => (
                      <li key={place} className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 text-[15px] text-slate-700 shadow-sm md:text-[17px]">
                        <span className="mt-2 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-[#25c3c8]" aria-hidden />
                        <span className="leading-7">{place}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-inner">
                <div className="relative h-72 md:h-full md:min-h-[420px]">
                  <iframe
                    src={`https://maps.google.com/maps?hl=vi&q=${encodeURIComponent(`${room.address}, ${room.city}`)}&z=15&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    title={`Ban do ${room.title}`}
                    className="grayscale transition-all duration-700 hover:grayscale-0"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
