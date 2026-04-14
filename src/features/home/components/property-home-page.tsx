import { FeaturedPostsSection } from "../../post/components";
import { getFeaturedPostsData } from "../../post/servers";
import { FeaturedPropertiesSection } from "../../property";
import { getPropertyLandingData } from "../../property/servers";
import { RentalByDistrictTabs } from "@/src/features/home/components/rental-by-district-tabs";
import { HeroSection } from "./hero-section";

export function PropertyHomePage() {
  const landingData = getPropertyLandingData();
  const featuredPosts = getFeaturedPostsData();

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
        <RentalByDistrictTabs />
      </main>
    </>
  );
}