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

    // Cơ bản kiểm tra dữ liệu đầu vào (bước 3 sẽ thêm xác thực chi tiết hơn)
    if (!postId || !reason) {
      return NextResponse.json(
        { success: false, message: "Thiếu postId hoặc reason" },
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
