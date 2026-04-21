import { connectDB } from "@/src/lib/mongoose";
import Post from "@/src/models/Post";
import User from "@/src/models/User";
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET as string;

const PROPERTY_TYPES = ["nha_o", "can_ho_chung_cu", "phong_tro"] as const;
const LISTING_TYPES = ["cho_thue"] as const;
const OWNER_TYPES = ["ca_nhan", "moi_gioi"] as const;
const MAX_IMAGE_COUNT = 10;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

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
  bedrooms?: number | string;
  bathrooms?: number | string;
  width?: number | string;
  length?: number | string;
  floors?: number | string;
  usableArea?: number | string;
  mainDirection?: string;
  legalStatus?: string;
  interiorStatus?: string;
  feature?: string;
  ownerType?: string;
  mediaUrls?: unknown;
};

type ParsedPostBody = {
  payload: CreatePostPayload;
  uploadedImageDataUrls: string[];
};

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
        bedrooms: getFormString(formData, "bedrooms"),
        bathrooms: getFormString(formData, "bathrooms"),
        width: getFormString(formData, "width"),
        length: getFormString(formData, "length"),
        floors: getFormString(formData, "floors"),
        usableArea: getFormString(formData, "usableArea"),
        mainDirection: getFormString(formData, "mainDirection"),
        legalStatus: getFormString(formData, "legalStatus"),
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
      area: toOptionalNumber(body.area),
      bedrooms: toOptionalNumber(body.bedrooms),
      bathrooms: toOptionalNumber(body.bathrooms),
      width: toOptionalNumber(body.width),
      length: toOptionalNumber(body.length),
      floors: toOptionalNumber(body.floors),
      usableArea: toOptionalNumber(body.usableArea),
      interiorStatus: toOptionalString(body.interiorStatus),
      feature: toOptionalString(body.feature),
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