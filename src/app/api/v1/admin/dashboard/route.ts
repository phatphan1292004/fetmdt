import { connectDB } from "@/src/lib/mongoose";
import { verifyToken } from "@/src/lib/jwt";
import User from "@/src/models/User";
import Post from "@/src/models/Post";
import Order from "@/src/models/Order";
import Report from "@/src/models/Report";
import { NextResponse } from "next/server";

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

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const calcGrowth = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Number((((curr - prev) / prev) * 100).toFixed(1));
    };

    // 1. Thống kê: Tổng người dùng
    const totalUsers = await User.countDocuments({});
    const totalUsersLastMonth = await User.countDocuments({ createdAt: { $lt: startOfThisMonth } });
    const userGrowth = calcGrowth(totalUsers, totalUsersLastMonth);

    // 2. Thống kê: Tin đang hiển thị
    const activePosts = await Post.countDocuments({ status: "published" });
    const activePostsLastMonth = await Post.countDocuments({ status: "published", createdAt: { $lt: startOfThisMonth } });
    const postGrowth = calcGrowth(activePosts, activePostsLastMonth);

    // 3. Thống kê: Doanh thu tháng này
    const revenueThisMonthResult = await Order.aggregate([
      { $match: { status: "completed", createdAt: { $gte: startOfThisMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const revenueThisMonth = revenueThisMonthResult[0]?.total || 0;

    const revenueLastMonthResult = await Order.aggregate([
      { $match: { status: "completed", createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const revenueLastMonth = revenueLastMonthResult[0]?.total || 0;
    const revenueGrowth = calcGrowth(revenueThisMonth, revenueLastMonth);

    // 4. Thống kê: Báo cáo vi phạm (số lượng báo cáo tạo mới trong tháng)
    const reportsThisMonth = await Report.countDocuments({ createdAt: { $gte: startOfThisMonth } });
    const reportsLastMonth = await Report.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } });
    const reportsGrowth = calcGrowth(reportsThisMonth, reportsLastMonth);

    // 5. Biểu đồ doanh thu 7 ngày qua
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      last7Days.push(d);
    }

    const ordersLast7Days = await Order.find({
      status: "completed",
      createdAt: { $gte: last7Days[0] }
    });

    const vnDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const revenueData7Days = last7Days.map(date => {
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const total = ordersLast7Days
        .filter(order => order.createdAt >= date && order.createdAt < nextDate)
        .reduce((sum, order) => sum + order.amount, 0);

      return {
        name: vnDays[date.getDay()],
        total
      };
    });

    // 6. Biểu đồ doanh thu tháng này theo tuần
    const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const ordersThisMonth = await Order.find({
      status: "completed",
      createdAt: { $gte: startOfThisMonth, $lte: endOfThisMonth }
    });

    const weekRanges = [
      { name: "Tuần 1", start: 1, end: 7 },
      { name: "Tuần 2", start: 8, end: 14 },
      { name: "Tuần 3", start: 15, end: 21 },
      { name: "Tuần 4", start: 22, end: endOfThisMonth.getDate() }
    ];

    const revenueDataThisMonth = weekRanges.map(w => {
      const startDate = new Date(now.getFullYear(), now.getMonth(), w.start, 0, 0, 0, 0);
      const endDate = new Date(now.getFullYear(), now.getMonth(), w.end, 23, 59, 59, 999);

      const total = ordersThisMonth
        .filter(order => order.createdAt >= startDate && order.createdAt <= endDate)
        .reduce((sum, order) => sum + order.amount, 0);

      return {
        name: w.name,
        total
      };
    });

    // 7. Danh sách tin chờ kiểm duyệt
    const pendingPosts = await Post.find({ status: "pending" })
      .populate("ownerId", "fullName")
      .sort({ createdAt: -1 });

    const pendingListings = pendingPosts.map((post: any) => {
      const diffMs = Date.now() - new Date(post.createdAt).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      let relativeTime = "Vừa xong";
      if (diffDays > 0) {
        relativeTime = `${diffDays} ngày trước`;
      } else if (diffHours > 0) {
        relativeTime = `${diffHours} giờ trước`;
      } else if (diffMins > 0) {
        relativeTime = `${diffMins} phút trước`;
      }

      return {
        id: post._id.toString(),
        title: post.title,
        owner: post.ownerId?.fullName || "Ẩn danh",
        price: post.price.toLocaleString("vi-VN") + "đ",
        time: relativeTime,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          userGrowth,
          activePosts,
          postGrowth,
          revenueThisMonth,
          revenueGrowth,
          reportsThisMonth,
          reportsGrowth
        },
        revenueData7Days,
        revenueDataThisMonth,
        pendingListings
      }
    });
  } catch (error: any) {
    console.error("Dashboard api error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
