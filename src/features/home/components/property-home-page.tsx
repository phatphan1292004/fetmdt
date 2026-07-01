import { FeaturedPostsSection, NewPostsSection } from "../../post/components";
import { getFeaturedPostsData, getNewestPostsData } from "../../post/servers";
import { FeaturedPropertiesSection } from "../../property";
import { getPropertyLandingData, PropertyCardData } from "../../property/servers";
import { RentalByDistrictTabs } from "@/src/features/home/components/rental-by-district-tabs";
import { HeroSection } from "./hero-section";

function mapPostToPropertyCard(post: any): PropertyCardData {
  const categoryMap: Record<string, "Phòng trọ" | "Căn hộ mini" | "Studio"> = {
    phong_tro: "Phòng trọ",
    can_ho_chung_cu: "Căn hộ mini",
    nha_o: "Studio",
  };

  const highlights = [];
  if (post.details?.hasAirConditioner) highlights.push("Có điều hòa");
  if (post.details?.curfewFree) highlights.push("Giờ giấc tự do");
  if (post.details?.hasPrivateWc) highlights.push("Khép kín");
  if (post.details?.hasFridge) highlights.push("Có tủ lạnh");

  if (highlights.length === 0) {
    highlights.push("Nhà mới xây", "Vị trí trung tâm", "Nội thất cơ bản");
  }

  let displayAddress = post.address || "";
  let displayCity = post.city || "";
  if (post.district) {
    displayCity = post.district;
  }

  const priceLabel = post.price
    ? new Intl.NumberFormat("vi-VN").format(post.price) + "đ"
    : "N/A";

  const availableCount = Math.floor(Math.random() * 5) + 1;

  return {
    id: post.slug || post.id || post._id?.toString() || "",
    title: post.title || "",
    address: displayAddress.split(",").slice(0, 2).join(",").trim(),
    city: displayCity,
    category: categoryMap[post.propertyType || ""] || "Phòng trọ",
    priceLabel: priceLabel,
    availableLabel: `Chỉ còn ${availableCount} phòng trống`,
    rating: 9.9,
    imageUrl: post.mediaUrls?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=80",
    highlights: highlights.slice(0, 3),
  };
}

export async function PropertyHomePage() {
  const landingData = getPropertyLandingData();
  const featuredPosts = await getFeaturedPostsData();
  const newestPosts = await getNewestPostsData();

  const dynamicProperties = featuredPosts.map(mapPostToPropertyCard);
  const combinedProperties = [...dynamicProperties, ...landingData.properties];

  const uniqueProperties: PropertyCardData[] = [];
  const seenIds = new Set<string>();
  for (const prop of combinedProperties) {
    if (!seenIds.has(prop.id)) {
      seenIds.add(prop.id);
      uniqueProperties.push(prop);
    }
  }

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
        <FeaturedPropertiesSection properties={uniqueProperties} />
        <FeaturedPostsSection posts={featuredPosts} />
        <NewPostsSection posts={newestPosts} />
        <RentalByDistrictTabs />
      </main>
    </>
  );
}