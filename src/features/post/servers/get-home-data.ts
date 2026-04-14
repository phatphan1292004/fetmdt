import { getPropertyLandingData } from "../../property/servers";
import type { PropertyCardData } from "../../property/servers";

export type PostCardData = PropertyCardData;

export function getFeaturedPostsData(): readonly PostCardData[] {
  return getPropertyLandingData().properties;
}
