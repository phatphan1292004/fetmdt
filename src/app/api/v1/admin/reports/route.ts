import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongoose";
import { verifyToken } from "@/src/lib/jwt";
import Report from "@/src/models/Report";
import User from "@/src/models/User";
import Post from "@/src/models/Post";
import Notification from "@/src/models/Notification";

function getToken(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth && auth.startsWith("Bearer ")) {
    return auth.split(" ")[1];
  }
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

    // Connect to DB and register models before populating
    await connectDB();
    if (!User || !Post) {
        console.log("Initialize models");
    }

    // Lấy query params (ví dụ: status, page, limit)
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    
    // Xây dựng query
    const query: any = {};
    if (status) {
      query.status = status;
    }

    // Lấy danh sách báo cáo, populate thông tin người dùng và tin đăng
    const reports = await Report.find(query)
      .populate({ path: "userId", select: "fullName email phone" })
      .populate({ path: "postId", select: "title slug" })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      message: "Lấy danh sách báo cáo thành công",
      data: reports,
    });
  } catch (error: any) {
    console.error("Lỗi khi lấy danh sách báo cáo:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}

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
    const { reportId, status } = body;

    if (!reportId || !status) {
      return NextResponse.json(
        { success: false, message: "Thiếu reportId hoặc status" },
        { status: 400 }
      );
    }

    if (!["resolved", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Trạng thái không hợp lệ" },
        { status: 400 }
      );
    }

    await connectDB();

    const reportObj = await Report.findById(reportId).populate("postId");
    if (!reportObj) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy báo cáo" },
        { status: 404 }
      );
    }

    const updatedReport = await Report.findByIdAndUpdate(
      reportId,
      { status },
      { new: true }
    );

    // Tạo thông báo cho người báo cáo
    try {
      const postTitle = (reportObj.postId as any)?.title || "tin đăng";
      if (status === "resolved") {
        await Notification.create({
          userId: reportObj.userId,
          type: "report_resolved",
          title: "Báo cáo đã được xử lý",
          message: `Báo cáo của bạn về tin đăng "${postTitle}" đã được duyệt và xử lý thành công.`,
          link: null,
        });
      } else if (status === "rejected") {
        await Notification.create({
          userId: reportObj.userId,
          type: "report_rejected",
          title: "Báo cáo bị từ chối",
          message: `Báo cáo của bạn về tin đăng "${postTitle}" đã bị từ chối do chưa đủ căn cứ.`,
          link: null,
        });
      }
    } catch (err) {
      console.error("Lỗi khi tạo thông báo báo cáo:", err);
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: updatedReport,
    });
  } catch (error: any) {
    console.error("Lỗi khi cập nhật báo cáo:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
