import { connectDB } from "@/src/lib/mongoose";
import Post from "@/src/models/Post";
import User from "@/src/models/User";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET as string;

const PROPERTY_TYPES = ["nha_o", "can_ho_chung_cu", "phong_tro"] as const;
const LISTING_TYPES = ["cho_thue"] as const;
const OWNER_TYPES = ["ca_nhan", "moi_gioi"] as const;
const PUBLIC_POST_STATUSES = ["pending", "published"] as const;
const MAX_IMAGE_COUNT = 10;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const DEFAULT_NEWEST_POST_LIMIT = 6;
const MAX_NEWEST_POST_LIMIT = 20;

type PropertyType = (typeof PROPERTY_TYPES)[number];
type ListingType = (typeof LISTING_TYPES)[number];
type OwnerType = (typeof OWNER_TYPES)[number];

type CreatePostPayload = {
  propertyType?: string;
  listingType?: string;
  projectName?: string;
  address?: string;
  showRoomCode?: boolean | string;
  title?: string;
  description?: string;
  price?: number | string;
  deposit?: number | string;
  area?: number | string;
  maxOccupants?: number | string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  width?: number | string;
  length?: number | string;
  floors?: number | string;
  usableArea?: number | string;
  frontage?: number | string;
  alleyWidth?: number | string;
  houseDirection?: string;
  legalStatus?: string;
  apartmentFloor?: number | string;
  buildingFloors?: number | string;
  hasBalcony?: boolean | string;
  balconyDirection?: string;
  managementFee?: number | string;
  hasLoft?: boolean | string;
  hasPrivateWc?: boolean | string;
  curfewFree?: boolean | string;
  hasAirConditioner?: boolean | string;
  hasFridge?: boolean | string;
  hasWashingMachine?: boolean | string;
  utilityPricing?: string;
  hasParking?: boolean | string;
  interiorStatus?: string;
  feature?: string;
  ownerType?: string;
  mediaUrls?: unknown;
};

type ParsedPostBody = {
  payload: CreatePostPayload;
  uploadedImageDataUrls: string[];
};

type PopulatedOwner = {
  _id: Types.ObjectId;
  fullName?: string;
};

type PublicPostDocument = {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId | PopulatedOwner;
  propertyType?: string;
  listingType?: string;
  projectName?: string;
  showRoomCode?: boolean;
  title?: string;
  description?: string;
  address?: string;
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
  createdAt?: Date;
  updatedAt?: Date;
};

type PublicPostApiData = {
  _id: string;
  id: string;
  ownerId: string | { _id: string; fullName?: string };
  ownerName: string;
  ownerPostCount: number;
} & Omit<PublicPostDocument, "_id" | "ownerId">;

class RequestValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "RequestValidationError";
    this.status = status;
  }
}

function getToken(req: Request): string | null {
  const authHeader = req.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const cookieHeader = req.headers.get("cookie") ?? "";

  return (
    cookieHeader
      .split("; ")
      .find((cookie) => cookie.startsWith("token="))
      ?.split("=")[1] ?? null
  );
}

function toTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toOptionalString(value: unknown): string | undefined {
  const parsed = toTrimmedString(value);
  return parsed.length ? parsed : undefined;
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "on" || normalized === "1";
  }

  return false;
}

function normalizeMediaUrls(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function getFormString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

async function fileToDataUrl(file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "image/jpeg";

  return `data:${mimeType};base64,${bytes.toString("base64")}`;
}

async function parsePostBody(req: Request): Promise<ParsedPostBody> {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const imageFiles = formData
      .getAll("images")
      .filter((item): item is File => item instanceof File && item.size > 0);

    if (imageFiles.length > MAX_IMAGE_COUNT) {
      throw new RequestValidationError(
        `Bạn chỉ có thể tải tối đa ${MAX_IMAGE_COUNT} ảnh`
      );
    }

    for (const image of imageFiles) {
      if (!image.type.startsWith("image/")) {
        throw new RequestValidationError("Chỉ chấp nhận tệp hình ảnh");
      }

      if (image.size > MAX_IMAGE_SIZE_BYTES) {
        throw new RequestValidationError(
          "Mỗi ảnh phải nhỏ hơn hoặc bằng 5MB"
        );
      }
    }

    const uploadedImageDataUrls = await Promise.all(
      imageFiles.map((image) => fileToDataUrl(image))
    );

    return {
      payload: {
        propertyType: getFormString(formData, "propertyType"),
        listingType: getFormString(formData, "listingType"),
        projectName: getFormString(formData, "projectName"),
        address: getFormString(formData, "address"),
        showRoomCode: getFormString(formData, "showRoomCode"),
        title: getFormString(formData, "title"),
        description: getFormString(formData, "description"),
        price: getFormString(formData, "price"),
        deposit: getFormString(formData, "deposit"),
        area: getFormString(formData, "area"),
        maxOccupants: getFormString(formData, "maxOccupants"),
        bedrooms: getFormString(formData, "bedrooms"),
        bathrooms: getFormString(formData, "bathrooms"),
        width: getFormString(formData, "width"),
        length: getFormString(formData, "length"),
        floors: getFormString(formData, "floors"),
        usableArea: getFormString(formData, "usableArea"),
        frontage: getFormString(formData, "frontage"),
        alleyWidth: getFormString(formData, "alleyWidth"),
        houseDirection: getFormString(formData, "houseDirection"),
        legalStatus: getFormString(formData, "legalStatus"),
        apartmentFloor: getFormString(formData, "apartmentFloor"),
        buildingFloors: getFormString(formData, "buildingFloors"),
        hasBalcony: getFormString(formData, "hasBalcony"),
        balconyDirection: getFormString(formData, "balconyDirection"),
        managementFee: getFormString(formData, "managementFee"),
        hasLoft: getFormString(formData, "hasLoft"),
        hasPrivateWc: getFormString(formData, "hasPrivateWc"),
        curfewFree: getFormString(formData, "curfewFree"),
        hasAirConditioner: getFormString(formData, "hasAirConditioner"),
        hasFridge: getFormString(formData, "hasFridge"),
        hasWashingMachine: getFormString(formData, "hasWashingMachine"),
        utilityPricing: getFormString(formData, "utilityPricing"),
        hasParking: getFormString(formData, "hasParking"),
        interiorStatus: getFormString(formData, "interiorStatus"),
        feature: getFormString(formData, "feature"),
        ownerType: getFormString(formData, "ownerType"),
      },
      uploadedImageDataUrls,
    };
  }

  return {
    payload: (await req.json()) as CreatePostPayload,
    uploadedImageDataUrls: [],
  };
}

function isPropertyType(value: string): value is PropertyType {
  return PROPERTY_TYPES.includes(value as PropertyType);
}

function isListingType(value: string): value is ListingType {
  return LISTING_TYPES.includes(value as ListingType);
}

function isOwnerType(value: string): value is OwnerType {
  return OWNER_TYPES.includes(value as OwnerType);
}

type BuildDetailsResult = {
  details: Record<string, unknown>;
  normalized: {
    area?: number;
    usableArea?: number;
    bedrooms?: number;
    bathrooms?: number;
    floors?: number;
    mainDirection?: string;
    legalStatus?: string;
    interiorStatus?: string;
  };
};

function requirePositiveNumber(value: unknown, message: string): number {
  const parsed = toOptionalNumber(value);

  if (parsed === undefined || parsed <= 0) {
    throw new RequestValidationError(message);
  }

  return parsed;
}

function requireString(value: unknown, message: string): string {
  const parsed = toOptionalString(value);

  if (!parsed) {
    throw new RequestValidationError(message);
  }

  return parsed;
}

function requireBooleanChoice(value: unknown, message: string): boolean {
  const normalized = toTrimmedString(value).toLowerCase();

  if (!["true", "false", "1", "0", "on", "off"].includes(normalized)) {
    throw new RequestValidationError(message);
  }

  return toBoolean(value);
}

function buildDetailsByPropertyType(
  propertyType: PropertyType,
  body: CreatePostPayload
): BuildDetailsResult {
  if (propertyType === "nha_o") {
    const landArea = requirePositiveNumber(
      body.area,
      "Vui lòng nhập diện tích đất cho nhà ở"
    );
    const usableArea = requirePositiveNumber(
      body.usableArea,
      "Vui lòng nhập diện tích sử dụng cho nhà ở"
    );
    const bedrooms = requirePositiveNumber(
      body.bedrooms,
      "Vui lòng nhập số phòng ngủ cho nhà ở"
    );
    const bathrooms = requirePositiveNumber(
      body.bathrooms,
      "Vui lòng nhập số phòng vệ sinh cho nhà ở"
    );
    const floors = requirePositiveNumber(
      body.floors,
      "Vui lòng nhập số tầng cho nhà ở"
    );
    const frontage = requirePositiveNumber(
      body.frontage,
      "Vui lòng nhập mặt tiền của nhà"
    );
    const alleyWidth = requirePositiveNumber(
      body.alleyWidth,
      "Vui lòng nhập độ rộng đường vào"
    );
    const houseDirection = requireString(
      body.houseDirection,
      "Vui lòng nhập hướng nhà"
    );
    const interiorStatus = toOptionalString(body.interiorStatus);
    const legalStatus = toOptionalString(body.legalStatus);

    return {
      details: {
        landArea,
        usableArea,
        bedrooms,
        bathrooms,
        floors,
        frontage,
        alleyWidth,
        houseDirection,
        interiorStatus: interiorStatus ?? null,
        legalStatus: legalStatus ?? null,
      },
      normalized: {
        area: landArea,
        usableArea,
        bedrooms,
        bathrooms,
        floors,
        mainDirection: houseDirection,
        legalStatus,
        interiorStatus,
      },
    };
  }

  if (propertyType === "can_ho_chung_cu") {
    const usableArea = requirePositiveNumber(
      body.usableArea,
      "Vui lòng nhập diện tích sử dụng của căn hộ"
    );
    const bedrooms = requirePositiveNumber(
      body.bedrooms,
      "Vui lòng nhập số phòng ngủ của căn hộ"
    );
    const bathrooms = requirePositiveNumber(
      body.bathrooms,
      "Vui lòng nhập số phòng vệ sinh của căn hộ"
    );
    const apartmentFloor = requirePositiveNumber(
      body.apartmentFloor,
      "Vui lòng nhập tầng của căn hộ"
    );
    const buildingFloors = requirePositiveNumber(
      body.buildingFloors,
      "Vui lòng nhập tổng số tầng của tòa"
    );
    const hasBalcony = requireBooleanChoice(
      body.hasBalcony,
      "Vui lòng chọn thông tin ban công"
    );
    const balconyDirection = hasBalcony
      ? requireString(body.balconyDirection, "Vui lòng nhập hướng ban công")
      : toOptionalString(body.balconyDirection);
    const interiorStatus = toOptionalString(body.interiorStatus);
    const managementFee = toOptionalNumber(body.managementFee);

    return {
      details: {
        usableArea,
        bedrooms,
        bathrooms,
        apartmentFloor,
        buildingFloors,
        hasBalcony,
        balconyDirection: balconyDirection ?? null,
        interiorStatus: interiorStatus ?? null,
        managementFee: managementFee ?? null,
      },
      normalized: {
        area: usableArea,
        usableArea,
        bedrooms,
        bathrooms,
        floors: apartmentFloor,
        mainDirection: balconyDirection,
        interiorStatus,
      },
    };
  }

  const roomArea = requirePositiveNumber(
    body.area,
    "Vui lòng nhập diện tích phòng trọ"
  );
  const maxOccupants = requirePositiveNumber(
    body.maxOccupants,
    "Vui lòng nhập số người tối đa"
  );
  const hasLoft = requireBooleanChoice(body.hasLoft, "Vui lòng chọn thông tin gác");
  const hasPrivateWc = requireBooleanChoice(
    body.hasPrivateWc,
    "Vui lòng chọn thông tin WC riêng"
  );
  const curfewFree = requireBooleanChoice(
    body.curfewFree,
    "Vui lòng chọn thông tin giờ giấc"
  );
  const hasAirConditioner = requireBooleanChoice(
    body.hasAirConditioner,
    "Vui lòng chọn thông tin máy lạnh"
  );
  const hasFridge = requireBooleanChoice(
    body.hasFridge,
    "Vui lòng chọn thông tin tủ lạnh"
  );
  const hasWashingMachine = requireBooleanChoice(
    body.hasWashingMachine,
    "Vui lòng chọn thông tin máy giặt"
  );
  const utilityPricing = requireString(
    body.utilityPricing,
    "Vui lòng nhập cách tính điện nước"
  );
  const hasParking = requireBooleanChoice(
    body.hasParking,
    "Vui lòng chọn thông tin chỗ để xe"
  );

  return {
    details: {
      area: roomArea,
      maxOccupants,
      hasLoft,
      hasPrivateWc,
      curfewFree,
      hasAirConditioner,
      hasFridge,
      hasWashingMachine,
      utilityPricing,
      hasParking,
    },
    normalized: {
      area: roomArea,
      usableArea: roomArea,
      bathrooms: hasPrivateWc ? 1 : 0,
      interiorStatus: toOptionalString(body.interiorStatus),
    },
  };
}

function normalizeNewestLimit(rawLimit: string | null): number {
  const parsed = Number(rawLimit);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_NEWEST_POST_LIMIT;
  }

  return Math.min(Math.floor(parsed), MAX_NEWEST_POST_LIMIT);
}

function isPopulatedOwner(
  owner: PublicPostDocument["ownerId"]
): owner is PopulatedOwner {
  return (
    typeof owner === "object" &&
    owner !== null &&
    "fullName" in owner
  );
}

function getPublicOwnerInfo(owner: PublicPostDocument["ownerId"]): {
  ownerId: string;
  ownerName: string;
} {
  if (isPopulatedOwner(owner)) {
    return {
      ownerId: String(owner._id),
      ownerName: owner.fullName?.trim() || "Chủ trọ",
    };
  }

  return {
    ownerId: String(owner),
    ownerName: "Chủ trọ",
  };
}

function mapPublicPostForResponse(
  post: PublicPostDocument,
  ownerPostCountMap: Map<string, number>
): PublicPostApiData {
  const { ownerId, ownerName } = getPublicOwnerInfo(post.ownerId);
  const postCount = ownerPostCountMap.get(ownerId) ?? 1;

  const serializedOwnerId = isPopulatedOwner(post.ownerId)
    ? {
        _id: String(post.ownerId._id),
        fullName: post.ownerId.fullName,
      }
    : String(post.ownerId);

  return {
    ...post,
    _id: String(post._id),
    ownerId: serializedOwnerId,
    id: String(post._id),
    ownerName,
    ownerPostCount: postCount,
  };
}

async function getNewestPublicPosts(
  limit: number
): Promise<PublicPostApiData[]> {
  await connectDB();

  const posts = await Post.find({
    status: { $in: PUBLIC_POST_STATUSES },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("ownerId", "fullName")
    .lean<PublicPostDocument[]>();

  if (!posts.length) {
    return [];
  }

  const ownerObjectIds = [...new Set(posts.map((post) => getPublicOwnerInfo(post.ownerId).ownerId))]
    .filter((ownerId) => Types.ObjectId.isValid(ownerId))
    .map((ownerId) => new Types.ObjectId(ownerId));

  const ownerPostCounts = ownerObjectIds.length
    ? await Post.aggregate<{ _id: Types.ObjectId; count: number }>([
        {
          $match: {
            ownerId: { $in: ownerObjectIds },
            status: { $in: PUBLIC_POST_STATUSES },
          },
        },
        {
          $group: {
            _id: "$ownerId",
            count: { $sum: 1 },
          },
        },
      ])
    : [];

  const ownerPostCountMap = new Map<string, number>(
    ownerPostCounts.map((item) => [String(item._id), item.count])
  );

  return posts.map((post) => mapPublicPostForResponse(post, ownerPostCountMap));
}

/**
 * @openapi
 * /api/v1/posts:
 *   get:
 *     summary: Lấy danh sách bài đăng mới nhất
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: query
 *         name: section
 *         schema:
 *           type: string
 *           enum: [newest]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 20
 *     responses:
 *       200:
 *         description: Lấy dữ liệu thành công
 *       400:
 *         description: Query không hợp lệ
 *       500:
 *         description: Lỗi server
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const section = toTrimmedString(searchParams.get("section") ?? "newest").toLowerCase();

    if (section !== "newest") {
      return NextResponse.json(
        {
          success: false,
          message: "Section không hợp lệ",
          data: [],
        },
        { status: 400 }
      );
    }

    const limit = normalizeNewestLimit(searchParams.get("limit"));
    const newestPosts = await getNewestPublicPosts(limit);

    return NextResponse.json({
      success: true,
      message: "Lấy danh sách bài đăng mới nhất thành công",
      data: newestPosts,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi server",
        data: [],
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


/**
 * @openapi
 * /api/v1/posts:
 *   post:
 *     summary: Tạo bài đăng cho thuê mới
 *     tags:
 *       - Posts
 *     description: |
 *       API tạo bài đăng cho thuê.
 *       Cần đăng nhập bằng JWT (cookie token hoặc Authorization Bearer).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propertyType
 *               - address
 *               - title
 *               - description
 *               - price
 *             properties:
 *               propertyType:
 *                 type: string
 *                 enum: [nha_o, can_ho_chung_cu, phong_tro]
 *               listingType:
 *                 type: string
 *                 enum: [cho_thue]
 *               projectName:
 *                 type: string
 *               address:
 *                 type: string
 *               showRoomCode:
 *                 type: boolean
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               deposit:
 *                 type: number
 *               area:
 *                 type: number
 *               bedrooms:
 *                 type: number
 *               bathrooms:
 *                 type: number
 *               width:
 *                 type: number
 *               length:
 *                 type: number
 *               floors:
 *                 type: number
 *               usableArea:
 *                 type: number
 *               mainDirection:
 *                 type: string
 *               legalStatus:
 *                 type: string
 *               interiorStatus:
 *                 type: string
 *               feature:
 *                 type: string
 *               ownerType:
 *                 type: string
 *                 enum: [ca_nhan, moi_gioi]
 *               mediaUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - propertyType
 *               - address
 *               - title
 *               - description
 *               - price
 *               - images
 *             properties:
 *               propertyType:
 *                 type: string
 *                 enum: [nha_o, can_ho_chung_cu, phong_tro]
 *               listingType:
 *                 type: string
 *                 enum: [cho_thue]
 *               projectName:
 *                 type: string
 *               address:
 *                 type: string
 *               showRoomCode:
 *                 type: boolean
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               deposit:
 *                 type: number
 *               area:
 *                 type: number
 *               bedrooms:
 *                 type: number
 *               bathrooms:
 *                 type: number
 *               width:
 *                 type: number
 *               length:
 *                 type: number
 *               floors:
 *                 type: number
 *               usableArea:
 *                 type: number
 *               interiorStatus:
 *                 type: string
 *               feature:
 *                 type: string
 *               ownerType:
 *                 type: string
 *                 enum: [ca_nhan, moi_gioi]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Tạo bài đăng thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 *       403:
 *         description: Tài khoản chưa được kích hoạt
 *       500:
 *         description: Lỗi server
 */
export async function POST(req: Request) {
  try {
    if (!JWT_SECRET) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu cấu hình JWT_SECRET",
          data: null,
        },
        { status: 500 }
      );
    }

    await connectDB();

    const token = getToken(req);

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Chưa đăng nhập",
          data: null,
        },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === "string" || !(decoded as JwtPayload).userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Token không hợp lệ",
          data: null,
        },
        { status: 401 }
      );
    }

    const userId = String((decoded as JwtPayload).userId);
    const user = await User.findById(userId).select("_id isVerified status");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy người dùng",
          data: null,
        },
        { status: 404 }
      );
    }

    if (!user.isVerified || user.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          message: "Tài khoản chưa được kích hoạt để đăng tin",
          data: null,
        },
        { status: 403 }
      );
    }

    const { payload: body, uploadedImageDataUrls } = await parsePostBody(req);

    const propertyTypeInput = toTrimmedString(body.propertyType);
    const listingTypeInput = toTrimmedString(body.listingType || "cho_thue");
    const ownerTypeInput = toTrimmedString(body.ownerType || "ca_nhan");

    if (!isPropertyType(propertyTypeInput)) {
      return NextResponse.json(
        {
          success: false,
          message: "Loại bất động sản không hợp lệ",
          data: null,
        },
        { status: 400 }
      );
    }

    if (!isListingType(listingTypeInput)) {
      return NextResponse.json(
        {
          success: false,
          message: "Nhu cầu đăng tin không hợp lệ",
          data: null,
        },
        { status: 400 }
      );
    }

    if (!isOwnerType(ownerTypeInput)) {
      return NextResponse.json(
        {
          success: false,
          message: "Loại người đăng không hợp lệ",
          data: null,
        },
        { status: 400 }
      );
    }

    const address = toTrimmedString(body.address);
    const title = toTrimmedString(body.title);
    const description = toTrimmedString(body.description);
    const price = toOptionalNumber(body.price);

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng điền địa chỉ",
          data: null,
        },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng nhập tiêu đề tin đăng",
          data: null,
        },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng nhập mô tả tin đăng",
          data: null,
        },
        { status: 400 }
      );
    }

    if (price === undefined || price <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Giá thuê phải lớn hơn 0",
          data: null,
        },
        { status: 400 }
      );
    }

    const mediaUrls = [
      ...normalizeMediaUrls(body.mediaUrls),
      ...uploadedImageDataUrls,
    ];

    if (mediaUrls.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng tải lên ít nhất 1 ảnh",
          data: null,
        },
        { status: 400 }
      );
    }

    const detailData = buildDetailsByPropertyType(propertyTypeInput, body);

    const newPost = new Post({
      ownerId: user._id,
      propertyType: propertyTypeInput,
      listingType: listingTypeInput,
      projectName: toOptionalString(body.projectName),
      address,
      showRoomCode: toBoolean(body.showRoomCode),
      title,
      description,
      price,
      deposit: toOptionalNumber(body.deposit),
      area: detailData.normalized.area ?? toOptionalNumber(body.area),
      bedrooms: detailData.normalized.bedrooms ?? toOptionalNumber(body.bedrooms),
      bathrooms: detailData.normalized.bathrooms ?? toOptionalNumber(body.bathrooms),
      width: toOptionalNumber(body.width),
      length: toOptionalNumber(body.length),
      floors: detailData.normalized.floors ?? toOptionalNumber(body.floors),
      usableArea:
        detailData.normalized.usableArea ??
        toOptionalNumber(body.usableArea) ??
        toOptionalNumber(body.area),
      mainDirection: detailData.normalized.mainDirection,
      legalStatus: detailData.normalized.legalStatus,
      interiorStatus:
        detailData.normalized.interiorStatus ?? toOptionalString(body.interiorStatus),
      feature: toOptionalString(body.feature),
      details: detailData.details,
      ownerType: ownerTypeInput,
      mediaUrls,
      status: "pending",
    });

    await newPost.validate();
    await newPost.save();

    return NextResponse.json(
      {
        success: true,
        message: "Tạo bài đăng thành công, tin đang chờ duyệt",
        data: {
          id: newPost._id,
          status: newPost.status,
          createdAt: newPost.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          data: null,
        },
        { status: error.status }
      );
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        {
          success: false,
          message: "Token không hợp lệ hoặc đã hết hạn",
          data: null,
        },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          message: "Dữ liệu bài đăng không hợp lệ",
          data: null,
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Lỗi server",
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}