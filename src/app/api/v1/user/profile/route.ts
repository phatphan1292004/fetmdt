import { connectDB } from "@/src/lib/mongoose";
import { verifyToken } from "@/src/lib/jwt";
import User from "@/src/models/User";
import { promises as fs } from "fs";
import path from "path";

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

    return Response.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const token = getToken(req);
    if (!token) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return Response.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    let body: any = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      body = {
        fullName: formData.get("fullName") || undefined,
        email: formData.get("email") || undefined,
        phone: formData.get("phone") || undefined,
        preferredArea: formData.get("preferredArea") || undefined,
        identityCard: formData.get("identityCard") || undefined,
        occupation: formData.get("occupation") || undefined,
      };
      const hobbiesStr = formData.get("hobbies") as string;
      if (hobbiesStr) {
        body.hobbies = hobbiesStr.split(",").map((s) => s.trim()).filter(Boolean);
      }
      
      // Handle avatar upload
      const avatarFile = formData.get("avatar");
      if (avatarFile && typeof avatarFile !== "string") {
        const bytes = await avatarFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const filename = `${Date.now()}-${avatarFile.name.replace(/\s+/g, '_')}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await fs.mkdir(uploadDir, { recursive: true });
        
        const filepath = path.join(uploadDir, filename);
        await fs.writeFile(filepath, buffer);
        
        body.avatarUrl = `/uploads/${filename}`;
      }
    } else {
      body = await req.json();
    }
    
    // Only allow updating specific fields to prevent mass assignment
    const allowedFields = [
      "fullName", "avatarUrl", "identityCard", "identityCardFrontUrl", 
      "identityCardBackUrl", "hobbies", "occupation", "preferredArea"
    ];
    
    const updateData: any = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    await connectDB();
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return Response.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return Response.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}
