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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getToken(req);
    if (!token) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return Response.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const resolvedParams = await params;
    const contractId = resolvedParams.id;
    const body = await req.json();
    const { action, signerB, paperImageTenant } = body;

    await connectDB();
    const user = await User.findById(decoded.userId);
    if (!user) {
      return Response.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return Response.json({ success: false, message: "Contract not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (action === "sign") {
      updateData.signerB = signerB || `Bên B xác thực SMS OTP (${user.phone}) - Ký số Smart-ID`;
      updateData.status = "Đã ký kết";
      updateData.tenantId = user._id; // Ensure link to renter's account
    } else if (action === "upload-paper") {
      updateData.paperImageTenant = paperImageTenant;
      if (contract.paperImageLandlord) {
        updateData.status = "Đã đối chiếu";
      }
    } else {
      return Response.json({ success: false, message: "Invalid action" }, { status: 400 });
    }

    const updatedContract = await Contract.findByIdAndUpdate(
      contractId,
      { $set: updateData },
      { new: true }
    );

    return Response.json({
      success: true,
      message: "Contract updated successfully",
      data: updatedContract,
    });
  } catch (error: any) {
    console.error("PATCH contract error:", error);
    return Response.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}
