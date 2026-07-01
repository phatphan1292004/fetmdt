import { connectDB } from "@/src/lib/mongoose";
import { verifyToken } from "@/src/lib/jwt";
import Order from "@/src/models/Order";
import User from "@/src/models/User"; // For population
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

    // 1. Chỉ số chính
    // Tổng doanh thu tích lũy
    const totalRevenueResult = await Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // Số giao dịch thành công
    const successfulTxCount = await Order.countDocuments({ status: "completed" });
    
    // Giá trị trung bình mỗi giao dịch (AOV)
    const avgOrderValue = successfulTxCount > 0 ? Math.round(totalRevenue / successfulTxCount) : 0;

    // Số giao dịch chờ duyệt
    const pendingTxCount = await Order.countDocuments({ status: "pending" });

    // 2. Xu hướng doanh thu 6 tháng gần đây
    const monthlyTrend = [];
    const monthNames = ["Thg 1", "Thg 2", "Thg 3", "Thg 4", "Thg 5", "Thg 6", "Thg 7", "Thg 8", "Thg 9", "Thg 10", "Thg 11", "Thg 12"];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const revResult = await Order.aggregate([
        { $match: { status: "completed", createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      const total = revResult[0]?.total || 0;

      monthlyTrend.push({
        name: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`,
        revenue: total
      });
    }

    // 3. Phân bố theo Gói tin
    const packageDistResult = await Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: "$packageId", value: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);

    const packageLabels: Record<string, string> = {
      supervip: "Super VIP",
      vip1: "VIP 1",
      vip2: "VIP 2",
      vip3: "VIP 3",
      free: "Miễn phí",
    };

    const packageDistribution = packageDistResult.map(item => ({
      name: packageLabels[item._id] || item._id || "Khác",
      value: item.value,
      count: item.count
    }));

    // Đảm bảo luôn có dữ liệu cho các gói chính nếu chưa có giao dịch nào để biểu đồ ko bị trống trải
    const mainPackages = ["Super VIP", "VIP 1", "VIP 2", "VIP 3"];
    mainPackages.forEach(pkg => {
      if (!packageDistribution.some(item => item.name === pkg)) {
        packageDistribution.push({ name: pkg, value: 0, count: 0 });
      }
    });

    // 4. Giao dịch thành công lớn nhất/gần đây
    const recentTransactions = await Order.find({ status: "completed" })
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 })
      .limit(5);

    const formattedTransactions = recentTransactions.map((tx: any) => ({
      id: tx._id.toString(),
      user: tx.userId?.fullName || "Người dùng ẩn",
      email: tx.userId?.email || "",
      packageName: tx.packageName,
      amount: tx.amount,
      date: new Date(tx.createdAt).toLocaleDateString("vi-VN"),
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalRevenue,
          avgOrderValue,
          successfulTxCount,
          pendingTxCount
        },
        monthlyTrend,
        packageDistribution,
        recentTransactions: formattedTransactions
      }
    });
  } catch (error: any) {
    console.error("Revenue api error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
