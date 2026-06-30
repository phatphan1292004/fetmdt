import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongoose";
import { verifyToken } from "@/src/lib/jwt";
import Notification from "@/src/models/Notification";

function getToken(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const target = "token=";
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(target))
    ?.slice(target.length) || null;
}

// GET: Lấy danh sách thông báo của user hiện tại
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

    // Lấy 30 thông báo mới nhất
    const notifications = await Notification.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    // Đếm số thông báo chưa đọc
    const unreadCount = await Notification.countDocuments({
      userId: decoded.userId,
      isRead: false,
    });

    return NextResponse.json({
      success: true,
      message: "Lấy thông báo thành công",
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error: any) {
    console.error("Lỗi khi lấy thông báo:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}

// PATCH: Đánh dấu thông báo đã đọc (1 hoặc tất cả)
export async function PATCH(req: Request) {
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
    const { notificationId, markAll } = body;

    await connectDB();

    if (markAll) {
      // Đánh dấu tất cả là đã đọc
      await Notification.updateMany(
        { userId: decoded.userId, isRead: false },
        { isRead: true }
      );
    } else if (notificationId) {
      // Đánh dấu 1 thông báo là đã đọc
      await Notification.findOneAndUpdate(
        { _id: notificationId, userId: decoded.userId },
        { isRead: true }
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Thiếu notificationId hoặc markAll" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đã đánh dấu đã đọc",
    });
  } catch (error: any) {
    console.error("Lỗi khi cập nhật thông báo:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
