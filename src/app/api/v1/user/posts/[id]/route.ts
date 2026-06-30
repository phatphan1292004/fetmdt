import { connectDB } from "@/src/lib/mongoose";
import { verifyToken } from "@/src/lib/jwt";
import Post from "@/src/models/Post";
import { NextResponse } from "next/server";

import {
  parsePostBody,
  buildDetailsByPropertyType,
  toTrimmedString,
  toOptionalNumber,
  normalizeMediaUrls,
  toBoolean,
  toOptionalCoordinate,
  toOptionalBoolean,
  RequestValidationError,
  PropertyType,
  ListingType,
  OwnerType,
  toOptionalString
} from "../../../posts/route";

function getToken(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const target = "token=";
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(target))
    ?.slice(target.length) || null;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getToken(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    // Tìm tin đăng và kiểm tra quyền sở hữu
    const post = await Post.findOne({ _id: id, ownerId: decoded.userId });

    if (!post) {
      return NextResponse.json({ success: false, message: "Không tìm thấy bài đăng hoặc bạn không có quyền xem" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Lấy thông tin thành công",
      data: post,
    });
  } catch (error: any) {
    console.error("GET POST API ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getToken(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    // 1. Tìm tin đăng, đảm bảo tồn tại và thuộc quyền sở hữu của user hiện tại
    const post = await Post.findOne({ _id: id, ownerId: decoded.userId });

    if (!post) {
      return NextResponse.json({ success: false, message: "Không tìm thấy bài đăng hoặc bạn không có quyền sửa" }, { status: 404 });
    }

    const contentType = req.headers.get("content-type") || "";

    // ==========================================
    // LUỒNG 1: Đổi trạng thái Ẩn/Hiện (Từ tab Quản lý tin đăng)
    // ==========================================
    if (contentType.includes("application/json")) {
      const { status } = await req.json();

      if (!["published", "hidden", "pending", "rejected"].includes(status)) {
        return NextResponse.json({ success: false, message: "Trạng thái không hợp lệ" }, { status: 400 });
      }

      post.status = status as any;
      await post.save();

      return NextResponse.json({
        success: true,
        message: "Cập nhật trạng thái thành công",
        data: post,
      });
    }

    // ==========================================
    // LUỒNG 2: Chỉnh sửa toàn bộ nội dung tin (Từ form sửa trang /post?edit=id)
    // ==========================================
    if (contentType.includes("multipart/form-data")) {
      const { payload: body, uploadedImageDataUrls } = await parsePostBody(req);

      const propertyTypeInput = toTrimmedString(body.propertyType || post.propertyType) as PropertyType;
      const detailData = buildDetailsByPropertyType(propertyTypeInput, body);

      // Gộp ảnh cũ giữ lại và ảnh mới upload
      const mediaUrls = [
        ...normalizeMediaUrls(body.mediaUrls),
        ...uploadedImageDataUrls,
      ];

      if (mediaUrls.length === 0) {
        return NextResponse.json({ success: false, message: "Vui lòng tải lên ít nhất 1 ảnh" }, { status: 400 });
      }

      const latitude = toOptionalCoordinate(body.latitude, -90, 90);
      const longitude = toOptionalCoordinate(body.longitude, -180, 180);
      const location = (latitude !== undefined && longitude !== undefined)
        ? { type: "Point", coordinates: [longitude, latitude] as [number, number] }
        : post.location;

      // Cập nhật các trường dữ liệu
      post.propertyType = propertyTypeInput;
      post.listingType = toTrimmedString(body.listingType || post.listingType) as ListingType;
      post.ownerType = toTrimmedString(body.ownerType || post.ownerType) as OwnerType;
      post.projectName = toOptionalString(body.projectName) ?? post.projectName;
      post.address = toTrimmedString(body.address || post.address);
      post.city = toOptionalString(body.city) ?? post.city;
      post.district = toOptionalString(body.district) ?? post.district;
      post.showRoomCode = body.showRoomCode !== undefined ? toBoolean(body.showRoomCode) : post.showRoomCode;

      post.title = toTrimmedString(body.title || post.title);
      post.description = toTrimmedString(body.description || post.description);
      post.price = toOptionalNumber(body.price) || post.price;
      post.deposit = toOptionalNumber(body.deposit) ?? post.deposit;

      post.area = detailData.normalized.area ?? toOptionalNumber(body.area) ?? post.area;
      post.bedrooms = detailData.normalized.bedrooms ?? toOptionalNumber(body.bedrooms) ?? post.bedrooms;
      post.bathrooms = detailData.normalized.bathrooms ?? toOptionalNumber(body.bathrooms) ?? post.bathrooms;
      post.width = toOptionalNumber(body.width) ?? post.width;
      post.length = toOptionalNumber(body.length) ?? post.length;
      post.floors = detailData.normalized.floors ?? toOptionalNumber(body.floors) ?? post.floors;
      post.usableArea = detailData.normalized.usableArea ?? toOptionalNumber(body.usableArea) ?? toOptionalNumber(body.area) ?? post.usableArea;

      post.mainDirection = detailData.normalized.mainDirection ?? post.mainDirection;
      post.legalStatus = detailData.normalized.legalStatus ?? post.legalStatus;
      post.interiorStatus = detailData.normalized.interiorStatus ?? toOptionalString(body.interiorStatus) ?? post.interiorStatus;
      post.feature = toOptionalString(body.feature) ?? post.feature;

      post.details = detailData.details;
      post.allowPets = toOptionalBoolean(body.allowPets) ?? (detailData.details.allowPets as boolean | undefined) ?? post.allowPets;
      post.mediaUrls = mediaUrls;

      if (location) post.set("location", location);

      // Nếu hệ thống bắt buộc duyệt lại tin sau khi sửa, bạn mở comment dòng này:
      post.status = "pending";

      await post.validate();
      await post.save();

      return NextResponse.json({
        success: true,
        message: "Cập nhật tin đăng thành công",
        data: post,
      });
    }

    return NextResponse.json({ success: false, message: "Yêu cầu không hợp lệ" }, { status: 400 });

  } catch (error: any) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    console.error("PATCH API ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}