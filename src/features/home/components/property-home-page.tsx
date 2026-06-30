import { Suspense } from "react";
import { FeaturedPostsSection, NewPostsSection } from "../../post/components";
import { getFeaturedPostsData, getNewestPostsData } from "../../post/servers";
import { FeaturedPropertiesSection } from "../../property";
import { getPropertyLandingData } from "../../property/servers";
import { RentalByDistrictTabs } from "@/src/features/home/components/rental-by-district-tabs";
import { HeroSection } from "./hero-section";

function PostCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-slate-200/90 bg-linear-to-b from-white to-slate-50 p-3 shadow-[0_14px_34px_rgba(15,23,42,0.1)] md:p-4">
      <div className="h-58 w-full rounded-2xl bg-slate-200 md:h-72" />
      <div className="px-1 pb-1 pt-4 md:px-2">
        <div className="h-7 w-3/4 rounded-md bg-slate-200" />
        <div className="mt-2 h-5 w-1/2 rounded-md bg-slate-200" />
        <div className="mt-4 flex gap-2">
          <div className="h-6 w-24 rounded-full bg-slate-200" />
          <div className="h-6 w-16 rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

function PostsSectionSkeleton({ title }: { title: string }) {
  return (
    <section className="bg-[#f3f5f7] py-16">
      <div className="mx-auto w-full max-w-350 px-4 lg:px-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-[26px] font-extrabold text-[#045a84] md:text-[32px]">{title}</h2>
          <div className="hidden h-6 w-20 animate-pulse rounded-md bg-slate-200 md:block" />
        </div>
        <div className="space-y-5">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      </div>
    </section>
  );
}

async function FeaturedPosts() {
  const posts = await getFeaturedPostsData();
  return <FeaturedPostsSection posts={posts} />;
}

async function NewestPosts() {
  const posts = await getNewestPostsData();
  return <NewPostsSection posts={posts} />;
}

export function PropertyHomePage() {
  const landingData = getPropertyLandingData();

  return (
    <>
      <main>
        <HeroSection
          heroImageUrl={landingData.heroImageUrl}
          searchPlaceholder={landingData.searchPlaceholder}
          priceOptions={landingData.priceOptions}
          areaOptions={landingData.areaOptions}
          roomTypeOptions={landingData.roomTypeOptions}
        />
        <FeaturedPropertiesSection properties={landingData.properties} />
        
        <Suspense fallback={<PostsSectionSkeleton title="Bài đăng nổi bật" />}>
          <FeaturedPosts />
        </Suspense>

        <Suspense fallback={<PostsSectionSkeleton title="Bài đăng mới nhất" />}>
          <NewestPosts />
        </Suspense>

        <RentalByDistrictTabs />
      </main>
    </>
  );
}