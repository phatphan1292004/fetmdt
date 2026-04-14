export type RoomContact = {
  name: string;
  phone: string;
  responseTime: string;
  avatarUrl: string;
};

export type RoomLocation = {
  districtLabel: string;
  mapLabel: string;
  nearbyPlaces: readonly string[];
};

export type AmenitySlug =
  | "wifi"
  | "air-conditioner"
  | "parking"
  | "washing-machine"
  | "security"
  | "fridge"
  | "wc"
  | "elevator"
  | "furnished"
  | "fingerprint-lock"
  | "water-heater"
  | "kitchen";

export type AmenityData = {
  id: string;
  name: string;
  slug: AmenitySlug;
};

export type RoomDetailData = {
  id: string;
  title: string;
  subtitle: string;
  districtSlug: string;
  slug: string;
  address: string;
  city: string;
  priceLabel: string;
  areaLabel: string;
  availableRoomsLabel: string;
  depositLabel: string;
  electricityPriceLabel: string;
  waterPriceLabel: string;
  description: string;
  amenities: readonly (AmenityData | string)[];
  rules: readonly string[];
  imageUrls: readonly string[];
  contact: RoomContact;
  location: RoomLocation;
};
