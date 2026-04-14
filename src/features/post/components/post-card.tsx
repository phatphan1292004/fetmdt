import type { PostCardData } from "../servers/get-home-data";

type PostCardProps = {
  post: PostCardData;
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
      <div className="absolute inset-0 bg-black/10" />
      {children}
    </div>
  );
}

export function PostCard({ post }: PostCardProps) {
  const galleryImages = [...post.imageUrls];

  while (galleryImages.length < 5) {
    galleryImages.push(post.imageUrl);
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_10px_28px_rgba(15,23,42,0.08)] md:p-4">
      <div className="overflow-hidden rounded-xl bg-slate-200">
        <div className="grid h-60 grid-cols-[1.1fr_1.1fr_1fr] gap-0.5 md:h-70">
          <GalleryCell imageUrl={galleryImages[0]}>
            <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[11px] font-semibold text-white md:text-[12px]">
              {post.tagLabel}
            </span>
          </GalleryCell>

          <GalleryCell imageUrl={galleryImages[1]} />

          <div className="grid grid-rows-2 gap-0.5">
            <GalleryCell imageUrl={galleryImages[2]} />
            <div className="grid grid-cols-2 gap-0.5">
              <GalleryCell imageUrl={galleryImages[3]} />
              <GalleryCell imageUrl={galleryImages[4]}>
                <div className="absolute inset-0 bg-black/35" />
                <span className="absolute left-2 top-2 text-[13px] font-bold text-white md:text-[14px]">+{post.extraImageCount}</span>
                <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] font-semibold text-white md:text-[12px]">
                  <span aria-hidden>◧</span>
                  {post.mediaCount}
                  <span aria-hidden>▸</span>
                </span>
              </GalleryCell>
            </div>
          </div>
        </div>
      </div>

      <div className="px-1 pb-1 pt-4 md:px-2">
        <h3 className="text-[16px] font-extrabold leading-tight text-slate-800 md:text-[22px]">{post.title}</h3>
        <p className="mt-1 text-[13px] text-slate-500 md:text-[17px]">{post.subtitle}</p>

        <div className="mt-2 flex items-end gap-4">
          <p className="text-[22px] font-extrabold leading-none text-[#ef2f3d] md:text-[28px]">{post.priceLabel}</p>
          <p className="text-[18px] leading-none text-slate-800 md:text-[20px]">{post.areaLabel}</p>
        </div>

        <p className="mt-2 text-[14px] text-slate-500 md:text-[16px]">
          <span aria-hidden className="mr-1">
            •
          </span>
          {post.city}
        </p>

        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
          <div className="flex items-center gap-2 md:gap-3">
            <div
              className="h-8 w-8 rounded-full bg-cover bg-center md:h-10 md:w-10"
              style={{ backgroundImage: `url(${post.authorAvatarUrl})` }}
              aria-hidden
            />
            <p className="text-[13px] font-medium text-slate-800 md:text-[15px]">{post.authorName}</p>
            <p className="text-[12px] text-slate-500 md:text-[14px]">{post.authorPostCountLabel}</p>
          </div>

          <button type="button" className="text-slate-700" aria-label="Luu bai dang">
            <svg viewBox="0 0 24 24" className="h-6 w-6 md:h-7 md:w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12.1 20.3l-1.1-1C6 15 3 12.3 3 8.9 3 6.1 5.1 4 7.9 4c1.6 0 3.1.8 4.1 2.1C13 4.8 14.5 4 16.1 4 18.9 4 21 6.1 21 8.9c0 3.4-3 6.1-8 10.4l-.9 1z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
