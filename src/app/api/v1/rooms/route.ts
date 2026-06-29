import { connectDB } from "@/src/lib/mongoose";
import Post from "@/src/models/Post";
import { mapPostToRoomDetail, normalizeSlug, serializePost, type RoomPostDocument } from "@/src/features/room/servers/room-mapper";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const PUBLIC_POST_STATUSES = ["pending", "published"] as const;

/**
 * @openapi
 * /api/v1/rooms:
 *   get:
 *     summary: Get room detail by slug
 *     tags:
 *       - Rooms
 *     parameters:
 *       - in: query
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Invalid slug
 *       404:
 *         description: Room not found
 *       500:
 *         description: Server error
 */
export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const slug = normalizeSlug(searchParams.get("slug"));

		if (!slug) {
			return NextResponse.json(
				{
					success: false,
					message: "Missing slug",
					data: null,
				},
				{ status: 400 }
			);
		}

		await connectDB();

		const post = await Post.findOne({ slug, status: { $in: PUBLIC_POST_STATUSES } })
			.populate("ownerId", "fullName phone avatarUrl responseRate")
			.lean<RoomPostDocument | null>();

		if (!post) {
			return NextResponse.json(
				{
					success: false,
					message: "Room not found",
					data: null,
				},
				{ status: 404 }
			);
		}

		const mappedRoom = mapPostToRoomDetail(serializePost(post));

		return NextResponse.json({
			success: true,
			message: "Room detail fetched",
			data: mappedRoom,
		});
	} catch (error: unknown) {
		return NextResponse.json(
			{
				success: false,
				message: "Server error",
				data: null,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
