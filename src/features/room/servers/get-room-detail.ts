import type { RoomDetailData } from "../types";

type RoomRoute = {
  district: string;
  slug: string;
};

const PROPERTY_ROUTE_MAP: Readonly<Record<string, RoomRoute>> = {
  "my-dinh-2": {
    district: "quan-nam-tu-liem",
    slug: "dreamhouse-2-my-dinh-nam-tu-liem-tn1033",
  },
  "my-dinh-1": {
    district: "quan-nam-tu-liem",
    slug: "dreamhouse-1-my-dinh-nam-tu-liem-tn1022",
  },
  "hoang-quoc": {
    district: "quan-cau-giay",
    slug: "dreamhouse-hoang-quoc-viet-cau-giay-tn0977",
  },
  "yen-hoa": {
    district: "quan-cau-giay",
    slug: "dreamhouse-yen-hoa-cau-giay-tn1051",
  },
};

const ROOM_DETAILS: readonly RoomDetailData[] = [
  {
    id: "my-dinh-2",
    title: "DreamHouse 2 My Dinh",
    subtitle: "Toa nha moi, full noi that, vi tri sat ben xe My Dinh",
    districtSlug: "quan-nam-tu-liem",
    slug: "dreamhouse-2-my-dinh-nam-tu-liem-tn1033",
    address: "Ngo 45 Duong My Dinh, Nam Tu Liem",
    city: "Ha Noi",
    priceLabel: "4.500.000d/thang",
    areaLabel: "20 - 28 m2",
    availableRoomsLabel: "Con 1 phong trong",
    depositLabel: "Dat coc 1 thang",
    electricityPriceLabel: "4.000d/kWh",
    waterPriceLabel: "100.000d/nguoi",
    description:
      "DreamHouse 2 phu hop cho nguoi di lam va sinh vien khu vuc Nam Tu Liem. Phong thoang, cua so lon, noi that moi va he thong camera an ninh 24/7.",
    amenities: [
      "Noi that day du",
      "May giat chung",
      "Thang may",
      "Khoa van tay",
      "Giu xe",
      "Internet toc do cao",
      "Dieu hoa",
      "Binh nong lanh",
    ],
    rules: [
      "Khong nuoi thu cung",
      "Khong hut thuoc trong phong",
      "Gio dong cua: 23:30",
      "Dien nuoc tinh theo dong ho",
    ],
    imageUrls: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80",
    ],
    contact: {
      name: "Tran Minh",
      phone: "0888.022.821",
      responseTime: "Phan hoi trong 5 phut",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
    },
    location: {
      districtLabel: "Quan Nam Tu Liem, Ha Noi",
      mapLabel: "Gan ben xe My Dinh, san van dong My Dinh, va nhieu truong dai hoc",
      nearbyPlaces: ["Ben xe My Dinh - 900m", "Keangnam Landmark - 1.2km", "DH Thuong Mai - 2.1km"],
    },
  },
  {
    id: "my-dinh-1",
    title: "DreamHouse 1 My Dinh",
    subtitle: "Can goc, view thoang, vao o ngay",
    districtSlug: "quan-nam-tu-liem",
    slug: "dreamhouse-1-my-dinh-nam-tu-liem-tn1022",
    address: "Pho My Dinh, Nam Tu Liem",
    city: "Ha Noi",
    priceLabel: "4.000.000d/thang",
    areaLabel: "18 - 25 m2",
    availableRoomsLabel: "Con 7 phong trong",
    depositLabel: "Dat coc 1 thang",
    electricityPriceLabel: "4.000d/kWh",
    waterPriceLabel: "100.000d/nguoi",
    description: "Phong moi, day du tien nghi, phu hop o lau dai.",
    amenities: ["Noi that day du", "Thang may", "Giu xe", "Dieu hoa", "Bep rieng"],
    rules: ["Khong on ao sau 22:30", "Khong nuoi thu cung"],
    imageUrls: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1495435229349-e86db7bfa013?auto=format&fit=crop&w=900&q=80",
    ],
    contact: {
      name: "Nguyen An",
      phone: "0888.022.821",
      responseTime: "Phan hoi trong 10 phut",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80",
    },
    location: {
      districtLabel: "Quan Nam Tu Liem, Ha Noi",
      mapLabel: "Trung tam khu My Dinh, di chuyen thuan tien",
      nearbyPlaces: ["SVD My Dinh - 1.0km", "Dai hoc Quoc Gia - 2.4km", "Big C Thang Long - 3.1km"],
    },
  },
  {
    id: "hoang-quoc",
    title: "DreamHouse Hoang Quoc Viet",
    subtitle: "Toa nha mini, an ninh, sat tuyen bus",
    districtSlug: "quan-cau-giay",
    slug: "dreamhouse-hoang-quoc-viet-cau-giay-tn0977",
    address: "Duong Hoang Quoc Viet, Cau Giay",
    city: "Ha Noi",
    priceLabel: "4.300.000d/thang",
    areaLabel: "19 - 26 m2",
    availableRoomsLabel: "Con 3 phong trong",
    depositLabel: "Dat coc 1 thang",
    electricityPriceLabel: "4.000d/kWh",
    waterPriceLabel: "100.000d/nguoi",
    description: "Vi tri trung tam Cau Giay, nhieu cua hang va dich vu xung quanh.",
    amenities: ["Noi that day du", "Wifi", "May giat", "Giu xe"],
    rules: ["Khong nuoi thu cung", "Khong tiec on ao"],
    imageUrls: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1560185008-a33f1adf39b5?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1560185009-5bf9f2849488?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=900&q=80",
    ],
    contact: {
      name: "Minh Chau",
      phone: "0888.022.821",
      responseTime: "Phan hoi trong 7 phut",
      avatarUrl: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=160&q=80",
    },
    location: {
      districtLabel: "Quan Cau Giay, Ha Noi",
      mapLabel: "Gan DH Dien luc, DH Quoc gia va cong vien Cau Giay",
      nearbyPlaces: ["DH Dien Luc - 600m", "Cong vien Cau Giay - 1.1km", "Bai do xe bus - 200m"],
    },
  },
  {
    id: "yen-hoa",
    title: "DreamHouse Yen Hoa",
    subtitle: "Phong co gac, khoa van tay, vao o ngay",
    districtSlug: "quan-cau-giay",
    slug: "dreamhouse-yen-hoa-cau-giay-tn1051",
    address: "Pho Yen Hoa, Cau Giay",
    city: "Ha Noi",
    priceLabel: "4.500.000d/thang",
    areaLabel: "22 - 30 m2",
    availableRoomsLabel: "Con 5 phong trong",
    depositLabel: "Dat coc 1 thang",
    electricityPriceLabel: "4.000d/kWh",
    waterPriceLabel: "100.000d/nguoi",
    description: "Khu dan tri cao, an ninh tot, phu hop cho sinh vien va nguoi di lam.",
    amenities: ["Noi that day du", "Khoa van tay", "May giat", "Thang may", "Wifi"],
    rules: ["Khong hut thuoc", "Giu ve sinh chung"],
    imageUrls: [
      "https://images.unsplash.com/photo-1616594039964-3f5f2f6c5f5a?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1617104551722-3b2d513664fd?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1617104678098-de229db51175?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1617103996702-96ff29b1c467?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1617104550469-89f0a8759f96?auto=format&fit=crop&w=900&q=80",
    ],
    contact: {
      name: "Quoc Bao",
      phone: "0888.022.821",
      responseTime: "Phan hoi trong 15 phut",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
    },
    location: {
      districtLabel: "Quan Cau Giay, Ha Noi",
      mapLabel: "Sat duong Yen Hoa, di chuyen nhanh sang Trung Kinh",
      nearbyPlaces: ["Trung tam thuong mai - 700m", "Cong vien Cầu Giay - 1.3km", "Tuyen Metro Nhon - 2.1km"],
    },
  },
];

function normalizeRouteSegment(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function buildRouteKey(district: string | null | undefined, slug: string | null | undefined): string {
  const normalizedDistrict = normalizeRouteSegment(district);
  const normalizedSlug = normalizeRouteSegment(slug);

  return `${normalizedDistrict}/${normalizedSlug}`;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildRoomRouteFromPropertyId(propertyId: string): string {
  const mappedRoute = PROPERTY_ROUTE_MAP[propertyId];

  if (mappedRoute) {
    return `/cho-thue-phong-tro-hn/${mappedRoute.district}/${mappedRoute.slug}`;
  }

  return `/cho-thue-phong-tro-hn/quan-ha-noi/${slugify(propertyId)}`;
}

export function getRoomDetailByRoute(district: string | null | undefined, slug: string | null | undefined): RoomDetailData | null {
  if (!normalizeRouteSegment(district) || !normalizeRouteSegment(slug)) {
    return null;
  }

  const key = buildRouteKey(district, slug);

  return ROOM_DETAILS.find((room) => buildRouteKey(room.districtSlug, room.slug) === key) ?? null;
}

export function getRelatedRooms(currentRoomId: string, limit = 3): readonly RoomDetailData[] {
  return ROOM_DETAILS.filter((room) => room.id !== currentRoomId).slice(0, limit);
}

export function getRoomsByDistrict(district: string): readonly RoomDetailData[] {
  const normalizedDistrict = district.trim().toLowerCase();

  return ROOM_DETAILS.filter((room) => room.districtSlug === normalizedDistrict);
}

export function getDistrictLabelFromSlug(district: string): string {
  const rooms = getRoomsByDistrict(district);

  if (rooms.length === 0) {
    return district
      .split("-")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return rooms[0].location.districtLabel;
}
