import { CiLocationOn } from "react-icons/ci";
import type { PostCardData, PostListingData, RawNewestPostData } from "../servers/get-home-data";

type PostCardProps = {
  post: PostListingData;
};

type GalleryCellProps = {
  imageUrl: string;
  className?: string;
  children?: React.ReactNode;
};

function GalleryCell({ imageUrl, className, children }: GalleryCellProps) {
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }} />
      <div className="absolute inset-0 bg-black/12" />
      {children}
    </div>
  );
}

const DEFAULT_GALLERY_IMAGE =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80";

const FEATURE_TRANSLATIONS: Record<string, string> = {
  "view-dep": "View đẹp",
  "view-thoang": "View thoáng",
};

function isFeaturedPost(post: PostListingData): post is PostCardData {
  return "priceLabel" in post && "areaLabel" in post && "authorAvatarUrl" in post;
}

function asTrimmedString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = value.trim();
  return parsed.length ? parsed : undefined;
}

function asPositiveNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return undefined;
}

function toTitleCase(value: string): string {
  return value
    .split(" ")
    .map((word) => (word ? `${word.charAt(0).toUpperCase()}${word.slice(1)}` : ""))
    .join(" ");
}

function formatSubtitle(subtitle?: string): string {
  const parsed = asTrimmedString(subtitle);

  if (!parsed) {
    return "Thông tin chi tiết đang cập nhật";
  }

  const normalizedKey = parsed.toLowerCase().replace(/_/g, "-").replace(/\s+/g, "-");
  const translated = FEATURE_TRANSLATIONS[normalizedKey];

  if (translated) {
    return translated;
  }

  if (/^[a-z0-9_-]+$/i.test(parsed)) {
    return toTitleCase(parsed.replace(/[_-]+/g, " "));
  }

  return parsed;
}

function formatPriceLabel(price?: number): string {
  if (!price || price <= 0) {
    return "Liên hệ";
  }

  return `${new Intl.NumberFormat("vi-VN").format(price)}đ`;
}

function formatAreaLabel(area?: number): string {
  if (!area || area <= 0) {
    return "Đang cập nhật";
  }

  return `${Number(area.toFixed(2))} m²`;
}

function normalizeAreaLabel(areaLabel?: string): string {
  const parsed = asTrimmedString(areaLabel);

  if (!parsed) {
    return "Đang cập nhật";
  }

  return parsed
    .replace(/m\s*2\b/gi, "m²")
    .replace(/m\^2\b/gi, "m²")
    .replace(/(\d)\s*m²/g, "$1 m²")
    .replace(/\s+/g, " ")
    .trim();
}

function formatCategory(propertyType?: string, category?: string): string {
  const categoryLabel = asTrimmedString(category);

  if (categoryLabel) {
    return categoryLabel;
  }

  if (propertyType === "can_ho_chung_cu") {
    return "Căn hộ mini";
  }

  if (propertyType === "nha_o") {
    return "Nhà ở";
  }

  return "Phòng trọ";
}

function formatPostStatus(status?: string): string {
  switch (status) {
    case "pending":
      return "Đang duyệt";
    case "published":
      return "Mới đăng";
    case "hidden":
      return "Tạm ẩn";
    case "rejected":
      return "Bị từ chối";
    case "draft":
      return "Bản nháp";
    default:
      return "Mới đăng";
  }
}

function mergeAddress(address?: string, city?: string): string {
  const safeAddress = asTrimmedString(address);
  const safeCity = asTrimmedString(city);

  if (safeAddress && safeCity) {
    const addressLower = safeAddress.toLowerCase();
    const cityLower = safeCity.toLowerCase();

    if (addressLower.includes(cityLower)) {
      return safeAddress;
    }

    return `${safeAddress}, ${safeCity}`;
  }

  return safeAddress ?? safeCity ?? "Đang cập nhật địa chỉ";
}

function extractOwnerName(post: RawNewestPostData): string {
  const directName = asTrimmedString(post.ownerName);

  if (directName) {
    return directName;
  }

  const ownerValue = post.ownerId;

  if (ownerValue && typeof ownerValue === "object") {
    const populatedName = asTrimmedString(ownerValue.fullName);

    if (populatedName) {
      return populatedName;
    }
  }

  return "Chủ trọ";
}

function buildAvatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0A6D97&color=fff`;
}

function getGalleryImages(post: PostListingData): { images: string[]; mediaCount: number; extraImageCount: number } {
  if (isFeaturedPost(post)) {
    const featuredImages = post.imageUrls.filter((url) => asTrimmedString(url));
    const images = featuredImages.length ? [...featuredImages] : [post.imageUrl];

    return {
      images,
      mediaCount: post.mediaCount,
      extraImageCount: post.extraImageCount,
    };
  }

  const mediaUrls = (post.mediaUrls ?? [])
    .map((url) => asTrimmedString(url))
    .filter((url): url is string => Boolean(url));

  const images = mediaUrls.length ? mediaUrls : [DEFAULT_GALLERY_IMAGE];
  const mediaCount = images.length;

  return {
    images,
    mediaCount,
    extraImageCount: Math.max(mediaCount - 4, 0),
  };
}

function resolveCardData(post: PostListingData) {
  if (isFeaturedPost(post)) {
    return {
      title: post.title,
      subtitle: formatSubtitle(post.subtitle),
      categoryLabel: post.category,
      statusLabel: post.availableLabel,
      priceLabel: post.priceLabel,
      areaLabel: normalizeAreaLabel(post.areaLabel),
      addressLabel: mergeAddress(post.address, post.city),
      tagLabel: post.tagLabel,
      authorName: post.authorName,
      authorAvatarUrl: post.authorAvatarUrl,
      authorPostCountLabel: post.authorPostCountLabel,
    };
  }

  const ownerName = extractOwnerName(post);
  const categoryFromLegacy = "category" in post ? asTrimmedString(post.category) : undefined;
  const cityFromLegacy = "city" in post ? asTrimmedString(post.city) : undefined;

  return {
    title: asTrimmedString(post.title) ?? "Tin cho thuê mới",
    subtitle: formatSubtitle(asTrimmedString(post.feature) ?? ("subtitle" in post ? asTrimmedString(post.subtitle) : undefined)),
    categoryLabel: formatCategory(post.propertyType, categoryFromLegacy),
    statusLabel: formatPostStatus(post.status),
    priceLabel: formatPriceLabel(asPositiveNumber(post.price)),
    areaLabel: formatAreaLabel(asPositiveNumber(post.usableArea) ?? asPositiveNumber(post.area)),
    addressLabel: mergeAddress(post.address, cityFromLegacy),
    tagLabel: "Bài đăng mới",
    authorName: ownerName,
    authorAvatarUrl: buildAvatarUrl(ownerName),
    authorPostCountLabel: `${post.ownerPostCount ?? 1} tin đăng`,
  };
}

export function PostCard({ post }: PostCardProps) {
  const { images, mediaCount, extraImageCount } = getGalleryImages(post);
  const cardData = resolveCardData(post);
  const galleryImages = [...images];

  while (galleryImages.length < 5) {
    galleryImages.push(galleryImages[0]);
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200/90 bg-linear-to-b from-white to-slate-50 p-3 shadow-[0_14px_34px_rgba(15,23,42,0.1)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.14)] md:p-4">
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-200">
        <div className="grid h-58 grid-cols-[1.2fr_1fr_0.9fr] gap-0.5 md:h-72">
          <GalleryCell imageUrl={galleryImages[0]}>
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-transparent" />
            <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-700 md:text-[12px]">
              {cardData.categoryLabel}
            </span>
            <span className="absolute bottom-2 left-2 rounded-full bg-emerald-600/95 px-2.5 py-1 text-[11px] font-semibold text-white md:text-[12px]">
              {cardData.tagLabel}
            </span>
          </GalleryCell>

          <GalleryCell imageUrl={galleryImages[1]} />

          <div className="grid grid-rows-2 gap-0.5">
            <GalleryCell imageUrl={galleryImages[2]} />
            <div className="grid grid-cols-2 gap-0.5">
              <GalleryCell imageUrl={galleryImages[3]} />
              <GalleryCell imageUrl={galleryImages[4]}>
                <div className="absolute inset-0 bg-black/35" />
                <span className="absolute left-2 top-2 text-[13px] font-bold text-white md:text-[14px]">+{extraImageCount}</span>
                <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] font-semibold text-white md:text-[12px]">
                  <span aria-hidden>◧</span>
                  {mediaCount}
                  <span aria-hidden>▸</span>
                </span>
              </GalleryCell>
            </div>
          </div>
        </div>
      </div>

      <div className="px-1 pb-1 pt-4 md:px-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-[22px] font-extrabold leading-tight text-slate-800 md:text-[30px]">{cardData.title}</h3>
        </div>

        <p className="mt-1 text-[14px] text-slate-600 md:text-[18px]">{cardData.subtitle}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2 md:gap-3">
          <p className="rounded-full bg-sky-50 px-3 py-1 text-[21px] font-extrabold leading-none text-sky-700 md:text-[20px]">
            {cardData.priceLabel} / tháng
          </p>
          <p className="rounded-full bg-sky-100 px-3 py-1 text-[14px] font-semibold leading-none text-sky-800 md:text-[14px]">
            {cardData.areaLabel}
          </p>
        </div>

        <p className="mt-3 flex items-center gap-2 text-[14px] text-slate-600 md:text-[16px]">
          <CiLocationOn size={18}/>
          <span>{cardData.addressLabel}</span>
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
          <div className="flex items-center gap-2 md:gap-3">
            <div
              className="h-9 w-9 rounded-full border border-slate-200 bg-cover bg-center md:h-10 md:w-10"
              style={{ backgroundImage: `url(${cardData.authorAvatarUrl})` }}
              aria-hidden
            />
            <p className="text-[13px] font-semibold text-slate-800 md:text-[15px]">{cardData.authorName}</p>
            <p className="text-[12px] text-slate-500 md:text-[14px]">{cardData.authorPostCountLabel}</p>
          </div>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-rose-300 hover:text-rose-500"
            aria-label="Lưu bài đăng"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 md:h-7 md:w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12.1 20.3l-1.1-1C6 15 3 12.3 3 8.9 3 6.1 5.1 4 7.9 4c1.6 0 3.1.8 4.1 2.1C13 4.8 14.5 4 16.1 4 18.9 4 21 6.1 21 8.9c0 3.4-3 6.1-8 10.4l-.9 1z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
