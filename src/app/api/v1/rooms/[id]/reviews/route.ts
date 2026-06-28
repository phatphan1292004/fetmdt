import { connectDB } from "@/src/lib/mongoose";
import { verifyToken } from "@/src/lib/jwt";
import Review from "@/src/models/Review";
import User from "@/src/models/User";
import Post from "@/src/models/Post";
import mongoose from "mongoose";

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
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ success: false, message: "ID bài đăng không hợp lệ" }, { status: 400 });
    }

    await connectDB();

    const reviews = await Review.find({
      postId: new mongoose.Types.ObjectId(id),
      status: "approved",
    }).sort({ createdAt: -1 });

    // Calculate dynamic rating details
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 5.0;

    return Response.json({
      success: true,
      data: {
        reviews,
        stats: {
          totalReviews,
          avgRating,
        }
      },
    });
  } catch (error: any) {
    console.error("GET Reviews error:", error);
    return Response.json({ success: false, message: "Không thể lấy danh sách đánh giá" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ success: false, message: "ID bài đăng không hợp lệ" }, { status: 400 });
    }

    const token = getToken(req);
    if (!token) {
      return Response.json({ success: false, message: "Bạn cần đăng nhập để đánh giá" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return Response.json({ success: false, message: "Phiên đăng nhập không hợp lệ" }, { status: 401 });
    }

    const body = await req.json();
    const { rating, content } = body;

    if (!rating || rating < 1 || rating > 5) {
      return Response.json({ success: false, message: "Điểm đánh giá phải từ 1 đến 5 sao" }, { status: 400 });
    }

    if (!content || !content.trim()) {
      return Response.json({ success: false, message: "Nội dung đánh giá không được để trống" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return Response.json({ success: false, message: "Người dùng không tồn tại" }, { status: 404 });
    }

    const post = await Post.findById(id);
    if (!post) {
      return Response.json({ success: false, message: "Bài đăng không tồn tại" }, { status: 404 });
    }

    // Check if user already reviewed this post
    const existingReview = await Review.findOne({
      userId: user._id,
      postId: post._id,
    });

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.content = content.trim();
      existingReview.status = "approved"; // default auto approved
      await existingReview.save();
      
      return Response.json({
        success: true,
        message: "Cập nhật đánh giá thành công",
        data: existingReview,
      });
    }

    const newReview = new Review({
      userId: user._id,
      userName: user.fullName || "Người dùng ẩn danh",
      userAvatarUrl: user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || "User")}&background=0A6D97&color=fff`,
      postId: post._id,
      postTitle: post.title,
      rating,
      content: content.trim(),
      status: "approved",
    });

    await newReview.save();

    return Response.json({
      success: true,
      message: "Đánh giá phòng thành công",
      data: newReview,
    });
  } catch (error: any) {
    console.error("POST Review error:", error);
    return Response.json({ success: false, message: "Không thể lưu đánh giá" }, { status: 500 });
  }
}
