import { connectDB } from "@/src/lib/mongoose";
import { verifyToken } from "@/src/lib/jwt";
import Review from "@/src/models/Review";
import User from "@/src/models/User";
import { NextResponse } from "next/server";

function getToken(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const target = "token=";
  return cookieHeader
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(target))
      ?.slice(target.length) || null;
}

export async function GET(req: Request) {
  try {
    const token = getToken(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    // Fetch all reviews, sorted by newest
    const reviews = await Review.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    console.error("GET Admin Reviews error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const token = getToken(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin cập nhật" }, { status: 400 });
    }

    if (!["pending", "approved", "hidden"].includes(status)) {
      return NextResponse.json({ success: false, message: "Trạng thái không hợp lệ" }, { status: 400 });
    }

    await connectDB();

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ success: false, message: "Đánh giá không tồn tại" }, { status: 404 });
    }

    review.status = status;
    await review.save();

    return NextResponse.json({
      success: true,
      message: "Cập nhật trạng thái đánh giá thành công",
      data: review,
    });
  } catch (error: any) {
    console.error("PATCH Admin Reviews error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
