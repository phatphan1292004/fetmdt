import Link from "next/link";
import { CiLocationOn } from "react-icons/ci";
import { buildRoomRouteFromSlug } from "@/src/features/room/servers";
import type { PostCardData, PostListingData, RawNewestPostData } from "../servers/get-home-data";
import type { RoomDetailData } from "@/src/features/room/types";

type PostCardProps = {
  post: PostListingData | RoomDetailData;
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
  // Features/subtitles from forms
  "nha-mat-tien": "Nhà mặt tiền",
  "hem-rong": "Hẻm rộng",
  "gan-truong-cho": "Gần trường/chợ",
  "phu-hop-gia-dinh": "Phù hợp gia đình",
  "ban-cong": "Có ban công",
  "view-dep": "View đẹp",
  "view-thoang": "View thoáng",
  "an-ninh-24-7": "An ninh 24/7",
  "gan-thang-may": "Gần thang máy",
  "co-gac": "Có gác",
  "wc-rieng": "WC riêng",
  "gio-giac-tu-do": "Giờ giấc tự do",
  "gan-trung-tam": "Gần trung tâm",

  // Legacy/Mock featured post subtitles/features
  "noi-that-cao-cap": "Nội thất cao cấp",
  "can-goc-view-thoang": "Căn góc, view thoáng",
  "nha-moi-vao-o-ngay": "Nhà mới, vào ở ngay",
  "thang-may-khoa-van-tay": "Thang máy, khóa vân tay",
  "tin-uu-tien": "Tin ưu tiên",
  "noi-that-day-du": "Nội thất đầy đủ",
  "phong-tro-cao-cap": "Phòng trọ cao cấp",
  "cho-thue": "Cho thuê",
};

const CATEGORY_TRANSLATIONS: Record<string, string> = {
  "phong-tro": "Phòng trọ",
  "nha-o": "Nhà ở",
  "can-ho-mini": "Căn hộ mini",
  "can-ho": "Căn hộ",
  "studio": "Studio",
  "nha-nguyen-can": "Nhà nguyên căn",
};

function isRoomDetail(post: unknown): post is RoomDetailData {
  return typeof post === "object" && post !== null && "contact" in post;
}

function isFeaturedPost(post: unknown): post is PostCardData {
  return (
    typeof post === "object" &&
    post !== null &&
    "priceLabel" in post &&
    "areaLabel" in post &&
    "authorAvatarUrl" in post
  );
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
    const normalizedKey = categoryLabel.toLowerCase().replace(/_/g, "-").replace(/\s+/g, "-");
    const translated = CATEGORY_TRANSLATIONS[normalizedKey];
    if (translated) {
      return translated;
    }
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

function formatTagLabel(tag?: string): string {
  const parsed = asTrimmedString(tag);
  if (!parsed) {
    return "Bài đăng mới";
  }
  const normalizedKey = parsed.toLowerCase().replace(/_/g, "-").replace(/\s+/g, "-");
  return FEATURE_TRANSLATIONS[normalizedKey] ?? parsed;
}

function formatPostCountLabel(countLabel?: string): string {
  const parsed = asTrimmedString(countLabel);
  if (!parsed) {
    return "1 tin đăng";
  }
  return parsed.replace(/tin\s+dang/gi, "tin đăng");
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

function getGalleryImages(post: PostListingData | RoomDetailData): { images: string[]; mediaCount: number; extraImageCount: number } {
  if (isRoomDetail(post)) {
    const images = post.imageUrls && post.imageUrls.length ? [...post.imageUrls] : [DEFAULT_GALLERY_IMAGE];
    return {
      images,
      mediaCount: images.length,
      extraImageCount: Math.max(images.length - 4, 0),
    };
  }

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

function resolveCardData(post: PostListingData | RoomDetailData) {
  if (isRoomDetail(post)) {
    return {
      title: post.title,
      subtitle: post.subtitle ?? "Thông tin đang cập nhật",
      categoryLabel: formatCategory(post.propertyType, undefined),
      statusLabel: post.availableRoomsLabel ?? "Còn phòng",
      priceLabel: post.priceLabel,
      areaLabel: post.areaLabel,
      addressLabel: post.address,
      tagLabel: post.vipType && post.vipType !== "free" ? "VIP" : "Bài đăng mới",
      authorName: post.contact?.name ?? "Chủ trọ",
      authorAvatarUrl: post.contact?.avatarUrl ?? buildAvatarUrl("Chủ trọ"),
      authorPostCountLabel: post.contact?.responseTime ?? "Mới tham gia",
    };
  }

  if (isFeaturedPost(post)) {
    return {
      title: post.title,
      subtitle: formatSubtitle(post.subtitle),
      categoryLabel: formatCategory(undefined, post.category),
      statusLabel: post.availableLabel,
      priceLabel: post.priceLabel,
      areaLabel: normalizeAreaLabel(post.areaLabel),
      addressLabel: mergeAddress(post.address, post.city),
      tagLabel: formatTagLabel(post.tagLabel),
      authorName: post.authorName,
      authorAvatarUrl: post.authorAvatarUrl,
      authorPostCountLabel: formatPostCountLabel(post.authorPostCountLabel),
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
  const postSlug = asTrimmedString("slug" in post ? post.slug : undefined) ?? ("id" in post ? post.id : undefined) ?? "";
  const detailHref = buildRoomRouteFromSlug(postSlug);

  const isVipActive = (() => {
    if (!("vipExpireAt" in post) || !post.vipExpireAt) {
      return false;
    }
    const expireTime = new Date(post.vipExpireAt).getTime();
    return expireTime > Date.now();
  })();

  const vipType = isVipActive && "vipType" in post ? post.vipType : "free";

  const getVipCardStyles = () => {
    switch (vipType) {
      case "supervip":
        return "border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)] bg-gradient-to-b from-red-50/5 via-white to-white";
      case "vip1": // VIP 1 (Siêu Cấp) - Glow border (orange glow border)
        return "border-2 border-amber-500 shadow-[0_0_22px_rgba(245,158,11,0.35)] relative before:absolute before:inset-0 before:rounded-3xl before:border-2 before:border-amber-400/60 before:pointer-events-none before:animate-pulse";
      case "vip2": // VIP 2 (Nổi Bật) - Viền xanh lá
        return "border-2 border-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.12)]";
      case "vip3": // VIP 3 (Tiết Kiệm) - Biểu tượng ngôi sao vàng nổi bật
        return "border border-sky-300 shadow-[0_4px_12px_rgba(14,165,233,0.06)]";
      default:
        return "border border-slate-200/90 shadow-[0_14px_34px_rgba(15,23,42,0.1)]";
    }
  };

  while (galleryImages.length < 5) {
    galleryImages.push(galleryImages[0]);
  }

  return (
    <article className={`flex flex-col h-full overflow-hidden rounded-3xl bg-linear-to-b from-white to-slate-50 p-3 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.14)] md:p-4 ${getVipCardStyles()}`}>
      <Link
        href={detailHref}
        className="relative block overflow-hidden rounded-2xl border border-slate-100 bg-slate-200 aspect-[4/3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b7ea9]"
        aria-label={`Xem chi tiết ${cardData.title}`}
      >
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${galleryImages[0]})` }} />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-transparent" />
        
        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-700 md:text-[12px]">
          {cardData.categoryLabel}
        </span>
        <span className="absolute bottom-2.5 left-2.5 rounded-full bg-emerald-600/95 px-2.5 py-1 text-[11px] font-semibold text-white md:text-[12px]">
          {cardData.tagLabel}
        </span>
        
        {isVipActive && vipType && vipType !== "free" && (
          <span className={`absolute right-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm z-10 ${
            vipType === "supervip" 
              ? "bg-red-500" 
              : vipType === "vip1" 
                ? "bg-amber-500" 
                : vipType === "vip2" 
                  ? "bg-emerald-500" 
                  : "bg-sky-500"
          }`}>
            {vipType === "supervip" ? "🏆 Super VIP" : vipType === "vip1" ? "⭐ VIP 1" : vipType === "vip2" ? "✨ VIP 2" : "✔ VIP 3"}
          </span>
        )}

        {mediaCount > 1 && (
          <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white md:text-[12px]">
            <span aria-hidden>◧</span>
            {mediaCount}
          </span>
        )}
      </Link>

      <div className="flex flex-col flex-1 px-1 pb-1 pt-4 md:px-2">
        <div className="flex-1">
          <Link
            href={detailHref}
            className="font-display block line-clamp-2 text-[16px] font-bold leading-snug text-slate-800 hover:text-[#0b7ea9] md:text-[18px] min-h-[44px] md:min-h-[48px]"
          >
            {cardData.title}
          </Link>
          
          <p className="mt-1 line-clamp-1 text-[13px] text-slate-500">{cardData.subtitle}</p>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <p className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[15px] font-bold leading-none text-sky-700 md:text-[16px]">
              {cardData.priceLabel} / tháng
            </p>
            <p className="rounded-full bg-sky-100/60 px-2.5 py-0.5 text-[12px] font-semibold leading-none text-sky-800">
              {cardData.areaLabel}
            </p>
          </div>
          
          <p className="mt-3 flex items-center gap-1.5 line-clamp-1 text-[13px] text-slate-500">
            <CiLocationOn size={16} className="shrink-0" />
            <span className="truncate">{cardData.addressLabel}</span>
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3">
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-full border border-slate-200 bg-cover bg-center"
              style={{ backgroundImage: `url(${cardData.authorAvatarUrl})` }}
              aria-hidden
            />
            <div>
              <p className="text-[12px] font-semibold text-slate-800 leading-none">{cardData.authorName}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-none">{cardData.authorPostCountLabel}</p>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-rose-300 hover:text-rose-500"
            aria-label="Lưu bài đăng"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12.1 20.3l-1.1-1C6 15 3 12.3 3 8.9 3 6.1 5.1 4 7.9 4c1.6 0 3.1.8 4.1 2.1C13 4.8 14.5 4 16.1 4 18.9 4 21 6.1 21 8.9c0 3.4-3 6.1-8 10.4l-.9 1z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
