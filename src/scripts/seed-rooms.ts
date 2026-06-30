import "dotenv/config";
import { connectDB } from "../lib/mongoose";
import Post from "../models/Post";
import mongoose from "mongoose";

const MOCK_ROOMS = [
  {
    title: "Phòng trọ cao cấp Cầu Giấy, Full Nội thất",
    slug: "phong-tro-cao-cap-cau-giay-1",
    description: "Phòng trọ mới xây, đầy đủ nội thất, giờ giấc tự do, an ninh tốt.",
    address: "Ngõ 130 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội",
    city: "Hà Nội",
    district: "Quận Cầu Giấy",
    price: 3500000,
    area: 25,
    usableArea: 25,
    bathrooms: 1,
    bedrooms: 1,
    propertyType: "phong_tro",
    ownerType: "ca_nhan",
    allowPets: false,
    interiorStatus: "đầy đủ",
    mediaUrls: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80"],
    status: "published",
    details: {
      hasAirConditioner: true,
      hasFridge: true,
      hasWashingMachine: false,
      hasParking: true,
      hasPrivateWc: true,
      curfewFree: true,
    },
    location: {
      type: "Point",
      coordinates: [105.7937, 21.0378], // Cầu Giấy
    },
  },
  {
    title: "Căn hộ mini ban công siêu thoáng Đống Đa",
    slug: "can-ho-mini-dong-da-2",
    description: "Căn hộ mini có ban công thoáng mát, thích hợp cho sinh viên và người đi làm.",
    address: "Ngõ 10 Tôn Thất Tùng, Trung Tự, Đống Đa, Hà Nội",
    city: "Hà Nội",
    district: "Quận Đống Đa",
    price: 5500000,
    area: 35,
    usableArea: 35,
    bathrooms: 1,
    bedrooms: 1,
    propertyType: "can_ho_chung_cu",
    ownerType: "ca_nhan",
    allowPets: true,
    interiorStatus: "đầy đủ",
    mediaUrls: ["https://images.unsplash.com/photo-1502672260266-1c1fe2d92015?auto=format&fit=crop&w=1400&q=80"],
    status: "published",
    details: {
      hasAirConditioner: true,
      hasFridge: true,
      hasWashingMachine: true,
      hasParking: true,
      hasPrivateWc: true,
      hasBalcony: true,
      curfewFree: true,
    },
    location: {
      type: "Point",
      coordinates: [105.8306, 21.0048], // Đống Đa
    },
  },
  {
    title: "Phòng trọ sinh viên giá rẻ gần ĐH Bách Khoa",
    slug: "phong-tro-gia-re-bach-khoa-3",
    description: "Phòng giá rẻ, an ninh, chủ nhà thân thiện. Chỉ cách ĐHBK 5p đi bộ.",
    address: "Ngõ 30 Tạ Quang Bửu, Bách Khoa, Hai Bà Trưng, Hà Nội",
    city: "Hà Nội",
    district: "Quận Hai Bà Trưng",
    price: 1800000,
    area: 15,
    usableArea: 15,
    bathrooms: 1,
    bedrooms: 1,
    propertyType: "phong_tro",
    ownerType: "ca_nhan",
    allowPets: false,
    interiorStatus: "cơ bản",
    mediaUrls: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1400&q=80"],
    status: "published",
    details: {
      hasAirConditioner: false,
      hasFridge: false,
      hasParking: true,
      hasPrivateWc: false,
      curfewFree: false,
    },
    location: {
      type: "Point",
      coordinates: [105.8488, 21.0044], // Hai Bà Trưng
    },
  },
  {
    title: "Nhà nguyên căn 2 tầng quận Bình Thạnh",
    slug: "nha-nguyen-can-binh-thanh-4",
    description: "Nhà hẻm xe hơi, rộng rãi, khu dân trí cao.",
    address: "Hẻm 33 Đường số 8, Phường 11, Bình Thạnh, Hồ Chí Minh",
    city: "Hồ Chí Minh",
    district: "Quận Bình Thạnh",
    price: 9000000,
    area: 50,
    usableArea: 100,
    bathrooms: 2,
    bedrooms: 2,
    propertyType: "nha_o",
    ownerType: "ca_nhan",
    allowPets: true,
    interiorStatus: "không nội thất",
    mediaUrls: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=80"],
    status: "published",
    details: {
      hasParking: true,
      hasPrivateWc: true,
      hasBalcony: true,
      curfewFree: true,
    },
    location: {
      type: "Point",
      coordinates: [106.6975, 10.8122], // Bình Thạnh
    },
  },
  {
    title: "Phòng có gác lửng Thủ Đức",
    slug: "phong-gac-lung-thu-duc-5",
    description: "Phòng mới xây có gác lửng đúc cao ráo, gần Làng Đại Học.",
    address: "Đường Kha Vạn Cân, Linh Trung, Thủ Đức, Hồ Chí Minh",
    city: "Hồ Chí Minh",
    district: "Thủ Đức",
    price: 2500000,
    area: 20,
    usableArea: 28,
    bathrooms: 1,
    bedrooms: 1,
    propertyType: "phong_tro",
    ownerType: "ca_nhan",
    allowPets: false,
    interiorStatus: "cơ bản",
    mediaUrls: ["https://images.unsplash.com/photo-1522771731478-44fb10e48d3c?auto=format&fit=crop&w=1400&q=80"],
    status: "published",
    details: {
      hasAirConditioner: false,
      hasFridge: false,
      hasParking: true,
      hasPrivateWc: true,
      hasLoft: true,
      curfewFree: true,
    },
    location: {
      type: "Point",
      coordinates: [106.7628, 10.8523], // Thủ Đức
    },
  },
  {
    title: "DreamHouse 2 Mỹ Đình",
    slug: "my-dinh-2",
    description: "DreamHouse 2 Mỹ Đình là hệ thống phòng trọ cao cấp, tọa lạc tại đường Mỹ Đình, Quận Nam Từ Liêm. Phòng rộng rãi, ngập tràn ánh sáng, đầy đủ tiện ích và không chung chủ.",
    address: "Đường Mỹ Đình, Quận Nam Từ Liêm, Hà Nội",
    city: "Hà Nội",
    district: "Quận Nam Từ Liêm",
    price: 4500000,
    area: 28,
    usableArea: 28,
    bathrooms: 1,
    bedrooms: 1,
    propertyType: "phong_tro",
    ownerType: "ca_nhan",
    allowPets: true,
    interiorStatus: "đầy đủ",
    mediaUrls: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"],
    status: "published",
    details: {
      hasAirConditioner: true,
      hasFridge: true,
      hasWashingMachine: true,
      hasParking: true,
      hasPrivateWc: true,
      curfewFree: true,
    },
    location: {
      type: "Point",
      coordinates: [105.7725, 21.0286], // Mỹ Đình
    },
  },
  {
    title: "DreamHouse 1 Mỹ Đình",
    slug: "my-dinh-1",
    description: "Căn hộ mini DreamHouse 1 Mỹ Đình nằm tại trung tâm Mỹ Đình, phòng đẹp ban công rộng rãi thoáng mát.",
    address: "Đường Mỹ Đình, Quận Nam Từ Liêm, Hà Nội",
    city: "Hà Nội",
    district: "Quận Nam Từ Liêm",
    price: 4000000,
    area: 32,
    usableArea: 32,
    bathrooms: 1,
    bedrooms: 1,
    propertyType: "can_ho_chung_cu",
    ownerType: "ca_nhan",
    allowPets: true,
    interiorStatus: "đầy đủ",
    mediaUrls: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"],
    status: "published",
    details: {
      hasAirConditioner: true,
      hasFridge: true,
      hasWashingMachine: true,
      hasParking: true,
      hasPrivateWc: true,
      curfewFree: true,
    },
    location: {
      type: "Point",
      coordinates: [105.7726, 21.0287], // Mỹ Đình
    },
  },
  {
    title: "DreamHouse Hoàng Quốc",
    slug: "hoang-quoc",
    description: "Studio DreamHouse Hoàng Quốc Việt thiết kế cực kỳ hiện đại, nội thất sang trọng, tối ưu không gian.",
    address: "Đường Hoàng Quốc Việt, Quận Cầu Giấy, Hà Nội",
    city: "Hà Nội",
    district: "Quận Cầu Giấy",
    price: 4300000,
    area: 25,
    usableArea: 25,
    bathrooms: 1,
    bedrooms: 1,
    propertyType: "phong_tro",
    ownerType: "ca_nhan",
    allowPets: false,
    interiorStatus: "đầy đủ",
    mediaUrls: ["https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80"],
    status: "published",
    details: {
      hasAirConditioner: true,
      hasFridge: true,
      hasWashingMachine: true,
      hasParking: true,
      hasPrivateWc: true,
      curfewFree: true,
    },
    location: {
      type: "Point",
      coordinates: [105.7981, 21.0465], // Hoàng Quốc Việt
    },
  },
  {
    title: "DreamHouse Yên Hòa - Cầu",
    slug: "yen-hoa",
    description: "Phòng trọ Yên Hòa, Cầu Giấy cao cấp, vị trí ngõ rộng ô tô đỗ cửa, an ninh cực tốt.",
    address: "Đường Yên Hòa, Quận Cầu Giấy, Hà Nội",
    city: "Hà Nội",
    district: "Quận Cầu Giấy",
    price: 4500000,
    area: 30,
    usableArea: 30,
    bathrooms: 1,
    bedrooms: 1,
    propertyType: "phong_tro",
    ownerType: "ca_nhan",
    allowPets: true,
    interiorStatus: "đầy đủ",
    mediaUrls: ["https://images.unsplash.com/photo-1616594039964-3f5f2f6c5f5a?auto=format&fit=crop&w=1200&q=80"],
    status: "published",
    details: {
      hasAirConditioner: true,
      hasFridge: true,
      hasWashingMachine: true,
      hasParking: true,
      hasPrivateWc: true,
      curfewFree: true,
    },
    location: {
      type: "Point",
      coordinates: [105.7946, 21.0189], // Yên Hòa
    },
  }
];

async function seed() {
  try {
    await connectDB();
    console.log("Connected to DB. Seeding mock data...");

    // Tự động gán ownerId ngẫu nhiên (hoặc tạo một objectId ảo vì nó chỉ để test)
    const mockOwnerId = new mongoose.Types.ObjectId();

    for (const room of MOCK_ROOMS) {
      // Check if already exists
      const existing = await Post.findOne({ slug: room.slug });
      if (!existing) {
        await Post.create({ ...room, ownerId: mockOwnerId });
        console.log(`Created room: ${room.title}`);
      } else {
        console.log(`Room already exists: ${room.title}`);
      }
    }
    
    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
