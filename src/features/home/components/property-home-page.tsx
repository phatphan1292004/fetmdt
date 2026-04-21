import { FeaturedPostsSection, NewPostsSection } from "../../post/components";
import { getFeaturedPostsData, getNewestPostsData } from "../../post/servers";
import { FeaturedPropertiesSection } from "../../property";
import { getPropertyLandingData } from "../../property/servers";
import { RentalByDistrictTabs } from "@/src/features/home/components/rental-by-district-tabs";
import { HeroSection } from "./hero-section";

export async function PropertyHomePage() {
  const landingData = getPropertyLandingData();
  const featuredPosts = getFeaturedPostsData();
  const newestPosts = await getNewestPostsData();

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
        <FeaturedPostsSection posts={featuredPosts} />
        <NewPostsSection posts={newestPosts} />
        <RentalByDistrictTabs />
      </main>
    </>
  );
}