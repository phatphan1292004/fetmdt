import { connectDB } from "@/src/lib/mongoose";
import Post from "@/src/models/Post";
import type { RoomDetailData } from "@/src/features/room";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const PUBLIC_POST_STATUSES = ["pending", "published"] as const;

type PopulatedOwner = {
	_id: Types.ObjectId;
	fullName?: string;
	phone?: string;
	avatarUrl?: string | null;
	responseRate?: number;
};

type RoomPostDocument = {
	_id: Types.ObjectId;
	ownerId: Types.ObjectId | PopulatedOwner;
	slug?: string;
	propertyType?: string;
	listingType?: string;
	projectName?: string;
	address?: string;
	showRoomCode?: boolean;
	title?: string;
	description?: string;
	price?: number;
	deposit?: number;
	area?: number;
	bedrooms?: number;
	bathrooms?: number;
	width?: number;
	length?: number;
	floors?: number;
	usableArea?: number;
	mainDirection?: string;
	legalStatus?: string;
	interiorStatus?: string;
	feature?: string;
	details?: Record<string, unknown>;
	ownerType?: string;
	mediaUrls?: string[];
	status?: string;
	createdAt?: Date;
	updatedAt?: Date;
};

function toTrimmedString(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}

function normalizeSlug(value: string | null): string {
	return toTrimmedString(value).toLowerCase();
}

function serializeOwner(owner: RoomPostDocument["ownerId"]) {
	if (typeof owner === "object" && owner !== null && "fullName" in owner) {
		return {
			_id: String(owner._id),
			fullName: owner.fullName ?? "",
			phone: owner.phone ?? "",
			avatarUrl: owner.avatarUrl ?? null,
			responseRate: owner.responseRate ?? null,
		};
	}

	return { _id: String(owner) };
}

function serializePost(post: RoomPostDocument) {
	return {
		...post,
		_id: String(post._id),
		ownerId: serializeOwner(post.ownerId),
	};
}

const DEFAULT_ROOM_IMAGE = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80";

function formatPriceLabel(price?: number): string {
	if (!price || price <= 0) {
		return "Liên hệ";
	}

	return `${new Intl.NumberFormat("vi-VN").format(price)}đ`;
}

function formatAreaLabel(area?: number): string {
	if (!area || area <= 0) {
		return "Đang cập nhật";
	}

	return `${Number(area.toFixed(2))} m²`;
}

function formatDepositLabel(deposit?: number): string {
	if (!deposit || deposit <= 0) {
		return "Thỏa thuận";
	}

	return `${new Intl.NumberFormat("vi-VN").format(deposit)}đ`;
}

function extractCityFromAddress(address?: string): string {
	if (!address) {
		return "Đang cập nhật";
	}

	const parts = address
		.split(",")
		.map((part) => part.trim())
		.filter(Boolean);

	return parts[parts.length - 1] ?? "Đang cập nhật";
}

function extractDistrictLabel(address?: string): string {
	if (!address) {
		return "Khu vực đang cập nhật";
	}

	const parts = address
		.split(",")
		.map((part) => part.trim())
		.filter(Boolean);

	if (parts.length >= 2) {
		return parts.slice(-2).join(", ");
	}

	return parts[0] ?? "Khu vực đang cập nhật";
}

function toBoolean(value: unknown): boolean {
	if (typeof value === "boolean") {
		return value;
	}

	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase();
		return normalized === "true" || normalized === "on" || normalized === "1";
	}

	return false;
}

function buildAmenities(details: Record<string, unknown>, interiorStatus?: string, feature?: string): string[] {
	const amenities: string[] = [];

	if (toBoolean(details.hasAirConditioner)) {
		amenities.push("Điều hòa");
	}

	if (toBoolean(details.hasFridge)) {
		amenities.push("Tủ lạnh");
	}

	if (toBoolean(details.hasWashingMachine)) {
		amenities.push("Máy giặt");
	}

	if (toBoolean(details.hasParking)) {
		amenities.push("Giữ xe");
	}

	if (toBoolean(details.hasPrivateWc)) {
		amenities.push("WC riêng");
	}

	if (toBoolean(details.hasBalcony)) {
		amenities.push("Ban công");
	}

	if (toBoolean(details.hasLoft)) {
		amenities.push("Có gác");
	}

	if (interiorStatus) {
		amenities.push(`Nội thất: ${interiorStatus}`);
	}

	if (feature) {
		amenities.push(feature);
	}

	return amenities;
}

function toSlug(value: string): string {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function mapPostToRoomDetail(post: ReturnType<typeof serializePost>): RoomDetailData {
	const address = post.address ?? "Đang cập nhật";
	const title = post.title ?? "Tin cho thuê";
	const slug = post.slug ?? toSlug(title);
	const imageUrls = post.mediaUrls?.length ? post.mediaUrls : [DEFAULT_ROOM_IMAGE];
	const owner = post.ownerId as { fullName?: string; phone?: string; avatarUrl?: string | null; responseRate?: number | null };
	const districtLabel = extractDistrictLabel(address);
	const details = post.details ?? {};

	return {
		id: post._id,
		title,
		subtitle: post.projectName ?? post.feature ?? "Thông tin đang cập nhật",
		districtSlug: toSlug(districtLabel),
		slug,
		address,
		city: extractCityFromAddress(address),
		priceLabel: formatPriceLabel(post.price),
		areaLabel: formatAreaLabel(post.usableArea ?? post.area),
		availableRoomsLabel: "Còn phòng",
		depositLabel: formatDepositLabel(post.deposit),
		electricityPriceLabel: "Liên hệ",
		waterPriceLabel: "Liên hệ",
		description: post.description ?? "Thông tin đang cập nhật",
		amenities: buildAmenities(details, post.interiorStatus, post.feature),
		rules: [],
		imageUrls,
		contact: {
			name: owner?.fullName ?? "Chủ trọ",
			phone: owner?.phone ?? "",
			responseTime:
				typeof owner?.responseRate === "number"
					? `Tỉ lệ phản hồi ${Math.round(owner.responseRate)}%`
					: "Phản hồi trong 10 phút",
			avatarUrl: owner?.avatarUrl ?? "https://ui-avatars.com/api/?name=Chu+tro&background=0A6D97&color=fff",
		},
		location: {
			districtLabel,
			mapLabel: address,
			nearbyPlaces: [],
		},
	};
}

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
