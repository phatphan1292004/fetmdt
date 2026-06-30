import { connectDB } from "@/src/lib/mongoose";
import { verifyToken } from "@/src/lib/jwt";
import User from "@/src/models/User";

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
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return Response.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone") || "";
    if (!phone) {
      return Response.json({ success: false, message: "Vui lòng cung cấp số điện thoại" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ phone: phone.trim() });

    if (!user) {
      return Response.json({ success: false, message: "Không tìm thấy khách thuê đăng ký số điện thoại này trên hệ thống!" }, { status: 404 });
    }

    return Response.json({
      success: true,
      data: {
        fullName: user.fullName,
        cccd: user.identityCard || "Chưa cập nhật CCCD",
        address: user.preferredArea || "Chưa cập nhật địa chỉ",
        phone: user.phone,
        email: user.email
      },
    });
  } catch (error) {
    console.error("Search user error:", error);
    return Response.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}
