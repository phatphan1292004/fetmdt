import { connectDB } from "@/src/lib/mongoose";
import { verifyToken } from "@/src/lib/jwt";
import Order from "@/src/models/Order";
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
    const { postId, packageId, packageName, amount, duration, description } = body;

    if (!postId || !packageId || !packageName || !amount || !duration || !description) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const newOrder = await Order.create({
      userId: decoded.userId,
      post: postId,
      packageId,
      packageName,
      amount,
      duration,
      status: "pending",
      description,
    });

    return NextResponse.json({
      success: true,
      data: newOrder,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
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
    const orders = await Order.find({ userId: decoded.userId }).sort({ createdAt: -1 });

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
