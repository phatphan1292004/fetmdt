import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongoose";
import { verifyToken } from "@/src/lib/jwt";
import Post from "@/src/models/Post";
import UserSavedPost from "@/src/models/UserSavedPost";

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

    const decoded: any = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    // 1. Lấy tất cả bài viết của user này (chỉ lấy _id và views để tối ưu)
    const userPosts = await Post.find(
      { ownerId: decoded.userId },
      "_id views"
    ).lean();

    // 2. Tính tổng số bài viết
    const totalPosts = userPosts.length;

    // 3. Tính tổng số lượt xem (views)
    const totalViews = userPosts.reduce((sum, post: any) => sum + (post.views || 0), 0);

    // 4. Lấy danh sách ID của các bài viết
    const postIds = userPosts.map((p: any) => p._id);

    // 5. Đếm tổng số lượt Lưu (Saved) của tất cả các bài viết này
    const totalSaved = await UserSavedPost.countDocuments({
      postId: { $in: postIds },
    });

    return NextResponse.json({
      success: true,
      message: "Lấy thống kê thành công",
      data: {
        totalPosts,
        totalViews,
        totalSaved,
      },
    });
  } catch (error: any) {
    console.error("Lỗi khi lấy thống kê chủ trọ:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
