import { connectDB } from "@/src/lib/mongoose";
import { verifyToken } from "@/src/lib/jwt";
import Order from "@/src/models/Order";
import Post from "@/src/models/Post";
import User from "@/src/models/User"; // Register User model for population
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

    // Query all orders and populate fields
    const orders = await Order.find()
      .populate("userId", "fullName")
      .populate("post", "title")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const token = getToken(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status || !["completed", "cancelled"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid payload params" },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    order.status = status;
    await order.save();

    // If order was approved, update the post status to "published" and activate the VIP package
    if (status === "completed") {
      const packageId = order.packageId;
      const durationDays = order.duration || 1;
      const expireAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
      
      const weights: Record<string, number> = {
        supervip: 5,
        vip1: 4,
        vip2: 3,
        vip3: 2,
        free: 0,
      };
      const weight = weights[packageId] ?? 0;

      await Post.findByIdAndUpdate(order.post, {
        status: "published",
        vipType: packageId,
        vipWeight: weight,
        vipExpireAt: expireAt,
        lastPushedAt: new Date(), // Push the post to top instantly upon activation
      });
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
