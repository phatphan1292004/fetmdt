import { connectDB } from "@/src/lib/mongoose";
import { verifyToken } from "@/src/lib/jwt";
import User from "@/src/models/User";
import Contract from "@/src/models/Contract";

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

    await connectDB();
    const user = await User.findById(decoded.userId);
    if (!user) {
      return Response.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Find contracts matching landlordId OR tenantId OR renterPhone (dynamic search)
    const contracts = await Contract.find({
      $or: [
        { landlordId: user._id },
        { tenantId: user._id },
        { renterPhone: user.phone },
      ],
    }).sort({ createdAt: -1 });

    return Response.json({
      success: true,
      data: contracts,
    });
  } catch (error: any) {
    console.error("GET contracts error:", error);
    return Response.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = getToken(req);
    if (!token) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return Response.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();

    // Verify current user
    const landlord = await User.findById(decoded.userId);
    if (!landlord) {
      return Response.json({ success: false, message: "Landlord user not found" }, { status: 404 });
    }

    // Attempt to automatically match tenant user if they already exist on Stayvia by phone number
    let tenantId = undefined;
    if (body.renterPhone) {
      const tenant = await User.findOne({ phone: body.renterPhone.trim() });
      if (tenant) {
        tenantId = tenant._id;
      }
    }

    const contractData = {
      ...body,
      landlordId: landlord._id,
      tenantId: tenantId || undefined,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate ? new Date(body.endDate) : new Date(),
      periodMonths: Number(body.periodMonths || 12),
    };

    const newContract = await Contract.create(contractData);

    return Response.json({
      success: true,
      message: "Contract created successfully",
      data: newContract,
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST contract error:", error);
    return Response.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}
