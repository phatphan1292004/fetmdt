import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongoose";
import { verifyToken } from "@/src/lib/jwt";
import Report from "@/src/models/Report";
import Post from "@/src/models/Post";

function getToken(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const target = "token=";
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(target))
    ?.slice(target.length) || null;
}

export async function POST(req: Request) {
  try {
    const token = getToken(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { postId, reason, description } = body;

    // Danh sách lý do hợp lệ
    const validReasons = ["spam", "fake", "wrong_price", "scam", "other"];

    // Xác thực dữ liệu đầu vào (Bước 3)
    if (!postId || typeof postId !== "string" || postId.length !== 24) {
      return NextResponse.json(
        { success: false, message: "Mã bài viết (postId) không hợp lệ" },
        { status: 400 }
      );
    }

    if (!reason || !validReasons.includes(reason)) {
      return NextResponse.json(
        { success: false, message: "Lý do báo cáo không hợp lệ" },
        { status: 400 }
      );
    }

    if (description && typeof description !== "string") {
      return NextResponse.json(
        { success: false, message: "Mô tả không hợp lệ" },
        { status: 400 }
      );
    }

    if (description && description.length > 500) {
      return NextResponse.json(
        { success: false, message: "Mô tả không được vượt quá 500 ký tự" },
        { status: 400 }
      );
    }

    await connectDB();

    // Kiểm tra bài đăng có tồn tại không
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy bài viết" },
        { status: 404 }
      );
    }

    // Tạo báo cáo mới
    const newReport = await Report.create({
      userId: decoded.userId,
      postId,
      reason,
      description: description || "",
      status: "pending",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Gửi báo cáo thành công",
        data: newReport,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Lỗi khi tạo báo cáo:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
