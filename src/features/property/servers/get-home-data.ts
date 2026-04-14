export type PropertyCardData = {
  id: string;
  title: string;
  address: string;
  city: string;
  priceLabel: string;
  availableLabel: string;
  rating: number;
  imageUrl: string;
  highlights: readonly string[];
};

export type PropertyLandingData = {
  hotline: string;
  heroImageUrl: string;
  searchPlaceholder: string;
  priceOptions: readonly string[];
  areaOptions: readonly string[];
  roomTypeOptions: readonly string[];
  properties: readonly PropertyCardData[];
};

const LANDING_DATA: PropertyLandingData = {
  hotline: "0888.022.821",
  heroImageUrl:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80",
  searchPlaceholder: "Tìm theo tên khu vực, trường, tòa nhà",
  priceOptions: ["Dưới 3 triệu", "3 - 5 triệu", "5 - 7 triệu", "7 - 10 triệu", "10 - 15 triệu", "Trên 15 triệu"],
  areaOptions: ["Dưới 20m2", "20 - 25 m2", "25 - 30 m2", "30 - 35 m2", "35 - 40 m2", "Trên 40 m2"],
  roomTypeOptions: ["Tất cả", "Studio", "Duplex", "1 phòng ngủ", "2 phòng ngủ", "3 phòng ngủ"],
  properties: [
    {
      id: "my-dinh-2",
      title: "DreamHouse 2 Mỹ Đình",
      address: "đường Mỹ Đình, Quận Nam Từ Liêm",
      city: "Hà Nội",
      priceLabel: "4.500.000đ",
      availableLabel: "Chỉ còn 1 phòng trống",
      rating: 9.9,
      imageUrl:
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      highlights: ["Nhà mới xây", "Vị trí trung tâm", "Nội thất hiện đại"],
    },
    {
      id: "my-dinh-1",
      title: "DreamHouse 1 Mỹ Đình",
      address: "đường Mỹ Đình, Quận Nam Từ Liêm",
      city: "Hà Nội",
      priceLabel: "4.000.000đ",
      availableLabel: "Chỉ còn 7 phòng trống",
      rating: 9.9,
      imageUrl:
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      highlights: ["Nhà mới xây", "Vị trí trung tâm", "Nội thất hiện đại"],
    },
    {
      id: "hoang-quoc",
      title: "DreamHouse Hoàng Quốc",
      address: "đường Hoàng Quốc Việt, Quận Cầu Giấy",
      city: "Hà Nội",
      priceLabel: "4.300.000đ",
      availableLabel: "Chỉ còn 3 phòng trống",
      rating: 9.9,
      imageUrl:
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
      highlights: ["Nhà mới xây", "Vị trí trung tâm", "Nội thất hiện đại"],
    },
    {
      id: "yen-hoa",
      title: "DreamHouse Yên Hòa - Cầu",
      address: "đường Yên Hòa, Quận Cầu Giấy",
      city: "Hà Nội",
      priceLabel: "4.500.000đ",
      availableLabel: "Chỉ còn 5 phòng trống",
      rating: 9.9,
      imageUrl:
        "https://images.unsplash.com/photo-1616594039964-3f5f2f6c5f5a?auto=format&fit=crop&w=1200&q=80",
      highlights: ["Nhà mới xây", "Vị trí trung tâm", "Nội thất hiện đại"],
    },
  ],
};

export function getPropertyLandingData(): PropertyLandingData {
  return LANDING_DATA;
}