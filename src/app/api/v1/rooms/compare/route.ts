import { connectDB } from "@/src/lib/mongoose";
import Post from "@/src/models/Post";
import { mapPostToRoomDetail, serializePost, type RoomPostDocument } from "@/src/features/room/servers/room-mapper";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idsString = searchParams.get("ids");

    if (!idsString) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const ids = idsString
      .split(",")
      .map(id => id.trim())
      .filter(id => mongoose.Types.ObjectId.isValid(id))
      .map(id => new mongoose.Types.ObjectId(id));

    if (ids.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    await connectDB();

    const posts = await Post.find({
      _id: { $in: ids },
    })
      .populate("ownerId", "fullName phone avatarUrl responseRate")
      .lean<RoomPostDocument[]>();

    // Map and preserve the order requested by idsString
    const postsMap = new Map(posts.map((post) => [post._id.toString(), post]));
    
    const orderedRooms = idsString
      .split(",")
      .map((id) => id.trim())
      .map((id) => postsMap.get(id))
      .filter((post): post is RoomPostDocument => !!post)
      .map((post) => mapPostToRoomDetail(serializePost(post)));

    return NextResponse.json({
      success: true,
      data: orderedRooms,
    });
  } catch (error: any) {
    console.error("GET Compare Rooms error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Không thể tải danh sách phòng so sánh",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
