import { connectDB } from "@/src/lib/mongoose";
import Post from "@/src/models/Post";
import { mapPostToRoomDetail, serializePost, type RoomPostDocument } from "@/src/features/room/servers/room-mapper";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const PUBLIC_POST_STATUSES = ["pending", "published"] as const;

export async function GET(req: Request) {
  try {
    await connectDB();

    const posts = await Post.find({ status: { $in: PUBLIC_POST_STATUSES } })
      .populate("ownerId", "fullName phone avatarUrl responseRate")
      .sort({ createdAt: -1 })
      .lean<RoomPostDocument[]>();

    const roomsDetail = posts.map((post) => {
      const room = mapPostToRoomDetail(serializePost(post));
      return {
        ...room,
        imageUrls: [],
      };
    });

    return NextResponse.json({
      success: true,
      message: "Fetched all rooms successfully",
      count: roomsDetail.length,
      data: roomsDetail
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
