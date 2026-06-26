import { connectDB } from "@/src/lib/mongoose";
import { verifyToken } from "@/src/lib/jwt";
import Post from "@/src/models/Post";
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
    const { status } = await req.json();

    if (!["published", "hidden"].includes(status)) {
      return NextResponse.json({ success: false, message: "Trạng thái không hợp lệ" }, { status: 400 });
    }

    await connectDB();
    const post = await Post.findOne({ _id: id, ownerId: decoded.userId });

    if (!post) {
      return NextResponse.json({ success: false, message: "Không tìm thấy bài đăng hoặc bạn không có quyền sửa" }, { status: 404 });
    }

    post.status = status as any;
    await post.save();

    return NextResponse.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: post,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
