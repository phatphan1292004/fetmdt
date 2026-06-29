import "dotenv/config";
import { connectDB } from "@/src/lib/mongoose";
import { verifyToken } from "@/src/lib/jwt";
import bcrypt from "bcryptjs";
import User from "@/src/models/User";
import { NextResponse } from "next/server";

export function getToken(req: Request) {
  // Try Authorization header first
  const auth = req.headers.get("authorization");
  if (auth && auth.startsWith("Bearer ")) {
    return auth.split(" ")[1];
  }
  // Try cookies
  const cookieHeader = req.headers.get("cookie") || "";
  const target = "token=";
  return cookieHeader
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(target))
      ?.slice(target.length) || null;
}

// Helper to check if caller is logged in
async function isAuthUser(req: Request) {
  const token = getToken(req);
  if (!token) return null;
  if (token === process.env.DEV_TOKEN) {
    return { role: "dev" };
  }

  try {
    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.userId) return null;
    return decoded;
  } catch (error) {
    return null;
  }
}

// 1. GET: Fetch all users
export async function GET(req: Request) {
  const caller = await isAuthUser(req);
  if (!caller) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const users = await User.find().sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      message: "Get users successfully",
      data: users,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 2. POST: Create a new user
export async function POST(req: Request) {
  const caller = await isAuthUser(req);
  if (!caller) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { fullName, email, phone, password, role } = await req.json();

    if (!fullName || !email || !phone || !password || !role) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    await connectDB();

    // Check existing
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json({ success: false, message: "Email đã tồn tại" }, { status: 400 });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return NextResponse.json({ success: false, message: "Số điện thoại đã tồn tại" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      phone,
      passwordHash,
      role,
      status: "active",
      isVerified: true,
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 3. PUT: Update user details
export async function PUT(req: Request) {
  const caller = await isAuthUser(req);
  if (!caller) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, message: "Thiếu user id" }, { status: 400 });
  }

  try {
    const body = await req.json();
    await connectDB();

    const user = await User.findById(id) as any;
    if (!user) {
      return NextResponse.json({ success: false, message: "Không tìm thấy người dùng" }, { status: 404 });
    }

    // Update fields
    if (body.fullName !== undefined) user.fullName = body.fullName;
    if (body.phone !== undefined) user.phone = body.phone;
    if (body.role !== undefined) user.role = body.role;
    if (body.status !== undefined) user.status = body.status;

    await user.save();

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 4. DELETE: Delete user
export async function DELETE(req: Request) {
  const caller = await isAuthUser(req);
  if (!caller) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, message: "Thiếu user id" }, { status: 400 });
  }

  try {
    await connectDB();
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return NextResponse.json({ success: false, message: "Không tìm thấy người dùng" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}