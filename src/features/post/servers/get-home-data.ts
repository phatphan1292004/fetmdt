import { getPropertyLandingData } from "../../property/servers";
import type { PropertyCardData } from "../../property/servers";

type PostMetaData = {
  subtitle: string;
  areaLabel: string;
  tagLabel: string;
  authorName: string;
  authorAvatarUrl: string;
  authorPostCountLabel: string;
  imageUrls: readonly string[];
  extraImageCount: number;
  mediaCount: number;
};

export type PostCardData = PropertyCardData & PostMetaData;

type PopulatedPostOwner = {
  _id: string;
  fullName?: string;
};

export type RawNewestPostData = {
  _id: string;
  id?: string;
  ownerId?: string | PopulatedPostOwner;
  ownerName?: string;
  ownerPostCount?: number;
  propertyType?: string;
  listingType?: string;
  projectName?: string;
  address?: string;
  showRoomCode?: boolean;
  title?: string;
  description?: string;
  price?: number;
  deposit?: number;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  width?: number;
  length?: number;
  floors?: number;
  usableArea?: number;
  mainDirection?: string;
  legalStatus?: string;
  interiorStatus?: string;
  feature?: string;
  details?: Record<string, unknown>;
  ownerType?: string;
  mediaUrls?: string[];
  status?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type PostListingData = PostCardData | RawNewestPostData;

function buildGallery(imageUrl: string): readonly string[] {
  return [
    imageUrl,
    `${imageUrl}&sat=-8`,
    `${imageUrl}&con=5`,
    `${imageUrl}&exp=7`,
    `${imageUrl}&bri=-4`,
  ];
}

const DEFAULT_AUTHOR_AVATAR =
  "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=120&q=80";

const POST_META_BY_PROPERTY_ID: Readonly<Record<string, Omit<PostMetaData, "imageUrls"> & { imageUrls?: readonly string[] }>> = {
  "my-dinh-2": {
    subtitle: "Noi that cao cap",
    areaLabel: "20 m2",
    tagLabel: "Tin uu tien",
    authorName: "Xuan Tung",
    authorAvatarUrl: "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=120&q=80",
    authorPostCountLabel: "2 tin dang",
    extraImageCount: 2,
    mediaCount: 6,
  },
  "my-dinh-1": {
    subtitle: "Can goc, view thoang",
    areaLabel: "22 m2",
    tagLabel: "Tin uu tien",
    authorName: "An Nguyen",
    authorAvatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80",
    authorPostCountLabel: "5 tin dang",
    extraImageCount: 3,
    mediaCount: 8,
  },
  "hoang-quoc": {
    subtitle: "Nha moi, vao o ngay",
    areaLabel: "18 m2",
    tagLabel: "Tin uu tien",
    authorName: "Minh Chau",
    authorAvatarUrl: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=120&q=80",
    authorPostCountLabel: "3 tin dang",
    extraImageCount: 1,
    mediaCount: 4,
  },
  "yen-hoa": {
    subtitle: "Thang may, khoa van tay",
    areaLabel: "24 m2",
    tagLabel: "Tin uu tien",
    authorName: "Quoc Bao",
    authorAvatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    authorPostCountLabel: "4 tin dang",
    extraImageCount: 2,
    mediaCount: 7,
  },
};

function getPostMetaData(property: PropertyCardData, index: number): PostMetaData {
  const mappedMeta = POST_META_BY_PROPERTY_ID[property.id];

  return {
    subtitle: mappedMeta?.subtitle ?? "Noi that cao cap",
    areaLabel: mappedMeta?.areaLabel ?? `${18 + index * 2} m2`,
    tagLabel: mappedMeta?.tagLabel ?? "Tin uu tien",
    authorName: mappedMeta?.authorName ?? "PhongTot Staff",
    authorAvatarUrl: mappedMeta?.authorAvatarUrl ?? DEFAULT_AUTHOR_AVATAR,
    authorPostCountLabel: mappedMeta?.authorPostCountLabel ?? "1 tin dang",
    imageUrls: mappedMeta?.imageUrls ?? buildGallery(property.imageUrl),
    extraImageCount: mappedMeta?.extraImageCount ?? 1,
    mediaCount: mappedMeta?.mediaCount ?? 4,
  };
}

export function getFeaturedPostsData(): readonly PostCardData[] {
  const propertyCards = getPropertyLandingData().properties;

  return propertyCards.map((property, index) => ({
    ...property,
    ...getPostMetaData(property, index),
  }));
}
