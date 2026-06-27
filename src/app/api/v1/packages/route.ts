import { connectDB } from "@/src/lib/mongoose";
import { verifyToken } from "@/src/lib/jwt";
import Package from "@/src/models/Package";
import { NextResponse } from "next/server";

export function getToken(req: Request) {
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
  } catch {
    return null;
  }
}

const seedPackages = [
  {
    code: "vip1",
    name: "VIP 1 (Siêu Cấp)",
    price: 50000,
    description: "Tiếp cận lượng khách hàng tối đa, ghim đầu trang tìm kiếm",
    features: [
      "Ghim đầu trang tìm kiếm danh mục",
      "Thẻ bài đăng nổi bật (Glow border)",
      "Tự động đẩy tin (Auto push) mỗi 2 giờ",
      "Tiếp cận lượng khách hàng gấp 10 lần",
      "Hỗ trợ thiết kế hình ảnh & bài đăng chuyên nghiệp",
    ],
    isPopular: true,
    color: "from-amber-500 to-orange-600",
    textColor: "text-amber-600",
  },
  {
    code: "vip2",
    name: "VIP 2 (Nổi Bật)",
    price: 30000,
    description: "Hiển thị nổi bật phía dưới tin VIP 1, tiếp cận gấp 5 lần",
    features: [
      "Hiển thị ưu tiên phía dưới gói VIP 1",
      "Thẻ bài đăng có viền xanh lá nổi bật",
      "Tự động đẩy tin (Auto push) mỗi 6 giờ",
      "Tiếp cận lượng khách hàng gấp 5 lần",
    ],
    isPopular: false,
    color: "from-emerald-500 to-teal-600",
    textColor: "text-emerald-600",
  },
  {
    code: "vip3",
    name: "VIP 3 (Tiết Kiệm)",
    price: 15000,
    description: "Hiển thị ưu tiên hơn tin thường, chi phí tiết kiệm",
    features: [
      "Hiển thị ưu tiên hơn tin thường",
      "Biểu tượng ngôi sao vàng nổi bật",
      "Tự động đẩy tin (Auto push) 1 làm/ngày",
      "Tiếp cận lượng khách hàng gấp 2.5 lần",
    ],
    isPopular: false,
    color: "from-blue-500 to-indigo-600",
    textColor: "text-blue-600",
  },
];

// 1. GET: Fetch all packages. Seeds default ones if database is empty.
export async function GET(req: Request) {
  try {
    await connectDB();
    let packages = await Package.find().sort({ price: -1 });
    
    if (packages.length === 0) {
      await Package.insertMany(seedPackages);
      packages = await Package.find().sort({ price: -1 });
    }

    return NextResponse.json({
      success: true,
      message: "Get packages successfully",
      data: packages,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 2. POST: Create a new package
export async function POST(req: Request) {
  const caller = await isAuthUser(req);
  if (!caller) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { code, name, price, description, features, isPopular, color, textColor } = body;

    if (!code || !name || price === undefined || !description) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    await connectDB();
    const existing = await Package.findOne({ code: code.toLowerCase() });
    if (existing) {
      return NextResponse.json({ success: false, message: "Mã gói tin đã tồn tại" }, { status: 400 });
    }

    const newPkg = await Package.create({
      code: code.toLowerCase(),
      name,
      price: Number(price),
      description,
      features: features || [],
      isPopular: !!isPopular,
      color: color || "from-blue-500 to-indigo-600",
      textColor: textColor || "text-blue-600",
    });

    return NextResponse.json({
      success: true,
      message: "Package created successfully",
      data: newPkg,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 3. PUT: Update a package
export async function PUT(req: Request) {
  const caller = await isAuthUser(req);
  if (!caller) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, message: "Thiếu mã gói tin" }, { status: 400 });
  }

  try {
    const body = await req.json();
    await connectDB();

    const pkg = await Package.findById(id);
    if (!pkg) {
      return NextResponse.json({ success: false, message: "Không tìm thấy gói tin" }, { status: 404 });
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.description !== undefined) updateData.description = body.description;
    if (body.features !== undefined) updateData.features = body.features;
    if (body.isPopular !== undefined) updateData.isPopular = !!body.isPopular;
    if (body.color !== undefined) updateData.color = body.color;
    if (body.textColor !== undefined) updateData.textColor = body.textColor;

    const updatedPkg = await Package.findByIdAndUpdate(id, { $set: updateData }, { new: true });

    return NextResponse.json({
      success: true,
      message: "Package updated successfully",
      data: updatedPkg,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 4. DELETE: Delete a package
export async function DELETE(req: Request) {
  const caller = await isAuthUser(req);
  if (!caller) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, message: "Thiếu mã gói tin" }, { status: 400 });
  }

  try {
    await connectDB();
    const deletedPkg = await Package.findByIdAndDelete(id);
    if (!deletedPkg) {
      return NextResponse.json({ success: false, message: "Không tìm thấy gói tin" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Package deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
