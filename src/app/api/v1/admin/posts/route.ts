import { connectDB } from "@/src/lib/mongoose";
import { verifyToken } from "@/src/lib/jwt";
import Post from "@/src/models/Post";
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

// Helper to generate a slug
function generateSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đ]/g, "d")
    .replace(/[Đ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-") + "-" + Date.now();
}

// 1. GET: Fetch all posts or a single post populated with owner
export async function GET(req: Request) {
  const caller = await isAuthUser(req);
  if (!caller) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    await connectDB();
    
    // Register User model before populating
    if (id) {
      const post = await Post.findById(id).populate("ownerId");
      if (!post) {
        return NextResponse.json({ success: false, message: "Không tìm thấy tin đăng" }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: "Get post successfully",
        data: post,
      });
    }

    const posts = await Post.find().populate("ownerId").sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      message: "Get posts successfully",
      data: posts,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// Helper functions to parse values
const parseNumber = (val: any) => {
  if (val === undefined || val === null || val === "") return undefined;
  const parsed = Number(val);
  return isNaN(parsed) ? undefined : parsed;
};

const parseBoolean = (val: any) => {
  if (val === undefined || val === null || val === "") return undefined;
  if (typeof val === "boolean") return val;
  return val === "true";
};

const parseMediaUrls = (val: any): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map(url => String(url).trim()).filter(url => url !== "");
  }
  if (typeof val === "string") {
    return val.split(",").map(url => url.trim()).filter(url => url !== "");
  }
  return [];
};

// 2. POST: Create new post
export async function POST(req: Request) {
  const caller = await isAuthUser(req);
  if (!caller) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { 
      title, 
      price, 
      status, 
      address, 
      owner, 
      phone,
      propertyType = "phong_tro",
      listingType = "cho_thue",
      projectName = "",
      deposit,
      area,
      bedrooms,
      bathrooms,
      width,
      length,
      floors,
      usableArea,
      mainDirection = "",
      legalStatus = "",
      interiorStatus = "",
      allowPets,
      ownerType = "ca_nhan",
      vipType = "free",
      description = "Được đăng bởi ban quản trị.",
      mediaUrls
    } = body;

    if (!title || !price || !status || !address || !owner || !phone) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    await connectDB();

    // Check or create user for the owner
    let landlord = await User.findOne({ phone });
    if (!landlord) {
      const bcrypt = require("bcryptjs");
      const passwordHash = await bcrypt.hash("123456", 10);
      landlord = await User.create({
        fullName: owner,
        phone,
        email: `${phone}@stayvia.dev`,
        passwordHash,
        role: "nguoi_cho_thue_tro",
        status: "active",
        isVerified: true
      });
    }

    const finalMediaUrls = parseMediaUrls(mediaUrls);
    if (finalMediaUrls.length === 0) {
      finalMediaUrls.push("https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=80");
    }

    const newPost = await Post.create({
      ownerId: landlord._id,
      title,
      price: Number(price),
      status,
      address,
      propertyType,
      listingType,
      projectName,
      deposit: parseNumber(deposit),
      area: parseNumber(area),
      bedrooms: parseNumber(bedrooms),
      bathrooms: parseNumber(bathrooms),
      width: parseNumber(width),
      length: parseNumber(length),
      floors: parseNumber(floors),
      usableArea: parseNumber(usableArea),
      mainDirection,
      legalStatus,
      interiorStatus,
      allowPets: parseBoolean(allowPets),
      ownerType,
      vipType,
      description,
      slug: generateSlug(title),
      mediaUrls: finalMediaUrls
    });

    return NextResponse.json({
      success: true,
      message: "Post created successfully",
      data: newPost,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 3. PUT: Update post
export async function PUT(req: Request) {
  const caller = await isAuthUser(req);
  if (!caller) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, message: "Thiếu mã tin đăng" }, { status: 400 });
  }

  try {
    const body = await req.json();
    await connectDB();

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ success: false, message: "Không tìm thấy tin đăng" }, { status: 404 });
    }

    // Update fields
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.propertyType !== undefined) updateData.propertyType = body.propertyType;
    if (body.listingType !== undefined) updateData.listingType = body.listingType;
    if (body.projectName !== undefined) updateData.projectName = body.projectName;
    if (body.deposit !== undefined) updateData.deposit = parseNumber(body.deposit);
    if (body.area !== undefined) updateData.area = parseNumber(body.area);
    if (body.bedrooms !== undefined) updateData.bedrooms = parseNumber(body.bedrooms);
    if (body.bathrooms !== undefined) updateData.bathrooms = parseNumber(body.bathrooms);
    if (body.width !== undefined) updateData.width = parseNumber(body.width);
    if (body.length !== undefined) updateData.length = parseNumber(body.length);
    if (body.floors !== undefined) updateData.floors = parseNumber(body.floors);
    if (body.usableArea !== undefined) updateData.usableArea = parseNumber(body.usableArea);
    if (body.mainDirection !== undefined) updateData.mainDirection = body.mainDirection;
    if (body.legalStatus !== undefined) updateData.legalStatus = body.legalStatus;
    if (body.interiorStatus !== undefined) updateData.interiorStatus = body.interiorStatus;
    if (body.allowPets !== undefined) updateData.allowPets = parseBoolean(body.allowPets);
    if (body.ownerType !== undefined) updateData.ownerType = body.ownerType;
    if (body.vipType !== undefined) updateData.vipType = body.vipType;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.mediaUrls !== undefined) {
      const parsedUrls = parseMediaUrls(body.mediaUrls);
      if (parsedUrls.length > 0) {
        updateData.mediaUrls = parsedUrls;
      }
    }

    const updatedPost = await Post.findByIdAndUpdate(id, { $set: updateData }, { new: true }).populate("ownerId");

    return NextResponse.json({
      success: true,
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 4. DELETE: Delete post
export async function DELETE(req: Request) {
  const caller = await isAuthUser(req);
  if (!caller) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, message: "Thiếu mã tin đăng" }, { status: 400 });
  }

  try {
    await connectDB();
    const deletedPost = await Post.findByIdAndDelete(id);
    if (!deletedPost) {
      return NextResponse.json({ success: false, message: "Không tìm thấy tin đăng" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
