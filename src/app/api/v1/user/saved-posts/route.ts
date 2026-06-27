import { connectDB } from "@/src/lib/mongoose";
import { verifyToken } from "@/src/lib/jwt";
import UserSavedPost from "@/src/models/UserSavedPost";
import Post from "@/src/models/Post";
import User from "@/src/models/User";
import { mapPostToRoomDetail, serializePost } from "@/src/features/room/servers/room-mapper";
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

    const decoded: any = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    await connectDB();

    if (postId) {
      // Check if this specific post is saved
      const saved = await UserSavedPost.findOne({ userId: decoded.userId, postId });
      return NextResponse.json({
        success: true,
        isSaved: !!saved,
      });
    }

    // Get all saved posts for this user
    const savedPosts = await UserSavedPost.find({ userId: decoded.userId })
      .populate({
        path: "postId",
        populate: {
          path: "ownerId",
          select: "fullName phone avatarUrl responseRate",
        },
      })
      .sort({ createdAt: -1 });

    const rooms = savedPosts
      .map((sp) => {
        if (!sp.postId) return null;
        try {
          // ensure model works by converting to object if possible
          const rawPost = sp.postId.toObject ? sp.postId.toObject() : sp.postId;
          return mapPostToRoomDetail(serializePost(rawPost));
        } catch (e) {
          console.error("Mapping error for saved post:", e);
          return null;
        }
      })
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      data: rooms,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
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
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ success: false, message: "Missing postId" }, { status: 400 });
    }

    await connectDB();

    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
    }

    // Upsert UserSavedPost
    await UserSavedPost.findOneAndUpdate(
      { userId: decoded.userId, postId },
      { userId: decoded.userId, postId },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Room saved successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const token = getToken(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json({ success: false, message: "Missing postId" }, { status: 400 });
    }

    await connectDB();

    await UserSavedPost.findOneAndDelete({ userId: decoded.userId, postId });

    return NextResponse.json({
      success: true,
      message: "Room unsaved successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
