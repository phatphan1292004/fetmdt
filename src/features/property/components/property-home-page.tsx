import { Footer, Header } from "../../../components";
import { getPropertyLandingData } from "../servers/get-home-data";
import { FeaturedPropertiesSection } from "./featured-properties-section";
import { FloatingContactButtons } from "./floating-contact-buttons";
import { HeroSection } from "./hero-section";

export function PropertyHomePage() {
  const landingData = getPropertyLandingData();

  return (
    <div className="min-h-screen bg-[#f3f5f7] text-slate-700">
      <Header hotline={landingData.hotline} />

      <main>
        <HeroSection
          heroImageUrl={landingData.heroImageUrl}
          searchPlaceholder={landingData.searchPlaceholder}
          priceOptions={landingData.priceOptions}
          areaOptions={landingData.areaOptions}
          roomTypeOptions={landingData.roomTypeOptions}
        />

        <FeaturedPropertiesSection properties={landingData.properties} />
      </main>

      <Footer hotline={landingData.hotline} />
      <FloatingContactButtons />
    </div>
  );
}