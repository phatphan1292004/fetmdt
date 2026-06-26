import { connectDB } from "@/src/lib/mongoose";
import Post from "@/src/models/Post";
import {
  mapPostToRoomDetail,
  serializePost,
  type RoomPostDocument,
} from "@/src/features/room/servers/room-mapper";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const PUBLIC_POST_STATUSES = ["pending", "published"] as const;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

const AMENITY_FIELD_MAP: Readonly<Record<string, string>> = {
  "air-conditioner": "hasAirConditioner",
  fridge: "hasFridge",
  "washing-machine": "hasWashingMachine",
  parking: "hasParking",
  "private-wc": "hasPrivateWc",
  loft: "hasLoft",
  balcony: "hasBalcony",
};

type RangeFilter = {
  min?: number;
  max?: number;
};

function toTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toOptionalString(value: unknown): string | undefined {
  const parsed = toTrimmedString(value);
  return parsed.length ? parsed : undefined;
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

function toOptionalBoolean(value: unknown): boolean | undefined {
  const normalized = toTrimmedString(value).toLowerCase();

  if (!normalized) {
    return undefined;
  }

  if (["true", "on", "1"].includes(normalized)) {
    return true;
  }

  if (["false", "off", "0"].includes(normalized)) {
    return false;
  }

  return undefined;
}

function toOptionalCoordinate(
  value: unknown,
  min: number,
  max: number
): number | undefined {
  const parsed = toOptionalNumber(value);

  if (parsed === undefined) {
    return undefined;
  }

  if (parsed < min || parsed > max) {
    return undefined;
  }

  return parsed;
}

function normalizeLimit(rawLimit: string | null): number {
  const parsed = Number(rawLimit);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }

  return Math.min(Math.floor(parsed), MAX_LIMIT);
}

function normalizePage(rawPage: string | null): number {
  const parsed = Number(rawPage);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 1;
  }

  return Math.floor(parsed);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseRange(value: string): RangeFilter | null {
  const [minRaw, maxRaw] = value.split("-");
  const min = minRaw ? Number(minRaw) : undefined;
  const max = maxRaw ? Number(maxRaw) : undefined;

  if ((minRaw && !Number.isFinite(min)) || (maxRaw && !Number.isFinite(max))) {
    return null;
  }

  if (min === undefined && max === undefined) {
    return null;
  }

  return {
    min: min !== undefined && min >= 0 ? min : undefined,
    max: max !== undefined && max >= 0 ? max : undefined,
  };
}

function buildNumberRangeFilter(field: string, range: RangeFilter) {
  if (range.min !== undefined && range.max !== undefined) {
    return { [field]: { $gte: range.min, $lte: range.max } };
  }

  if (range.min !== undefined) {
    return { [field]: { $gte: range.min } };
  }

  if (range.max !== undefined) {
    return { [field]: { $lte: range.max } };
  }

  return null;
}

function buildAreaRangeFilter(range: RangeFilter) {
  const condition: Record<string, number> = {};

  if (range.min !== undefined) {
    condition.$gte = range.min;
  }

  if (range.max !== undefined) {
    condition.$lte = range.max;
  }

  if (Object.keys(condition).length === 0) {
    return null;
  }

  return {
    $or: [{ area: condition }, { usableArea: condition }],
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const keyword = toOptionalString(searchParams.get("q"));
    const locationText = toOptionalString(searchParams.get("locationText"));
    const city = toOptionalString(searchParams.get("city"));
    const district = toOptionalString(searchParams.get("district"));
    const propertyType = toOptionalString(searchParams.get("propertyType"));
    const interiorStatus = toOptionalString(searchParams.get("interiorStatus"));
    const allowPets = toOptionalBoolean(searchParams.get("allowPets"));
    const curfewFree = toOptionalBoolean(searchParams.get("curfewFree"));
    const minPrice = toOptionalNumber(searchParams.get("minPrice"));
    const maxPrice = toOptionalNumber(searchParams.get("maxPrice"));
    const minArea = toOptionalNumber(searchParams.get("minArea"));
    const maxArea = toOptionalNumber(searchParams.get("maxArea"));
    const minBedrooms = toOptionalNumber(searchParams.get("minBedrooms"));
    const minBathrooms = toOptionalNumber(searchParams.get("minBathrooms"));
    const latitude = toOptionalCoordinate(searchParams.get("lat"), -90, 90);
    const longitude = toOptionalCoordinate(searchParams.get("lng"), -180, 180);
    const radiusKm = toOptionalNumber(searchParams.get("radiusKm"));
    const priceRanges = searchParams.getAll("priceRange");
    const areaRanges = searchParams.getAll("areaRange");
    const amenities = searchParams.getAll("amenities");

    const limit = normalizeLimit(searchParams.get("limit"));
    const page = normalizePage(searchParams.get("page"));
    const skip = (page - 1) * limit;

    const andFilters: Record<string, unknown>[] = [
      { status: { $in: PUBLIC_POST_STATUSES } },
    ];

    if (keyword) {
      const keywordRegex = new RegExp(escapeRegex(keyword), "i");
      andFilters.push({
        $or: [
          { title: keywordRegex },
          { description: keywordRegex },
          { address: keywordRegex },
          { projectName: keywordRegex },
        ],
      });
    }

    if (locationText) {
      const locationRegex = new RegExp(escapeRegex(locationText), "i");
      andFilters.push({
        $or: [
          { address: locationRegex },
          { city: locationRegex },
          { district: locationRegex },
        ],
      });
    }

    if (city) {
      const cityRegex = new RegExp(escapeRegex(city), "i");
      andFilters.push({
        $or: [{ city: cityRegex }, { address: cityRegex }],
      });
    }

    if (district) {
      const districtRegex = new RegExp(escapeRegex(district), "i");
      andFilters.push({
        $or: [{ district: districtRegex }, { address: districtRegex }],
      });
    }

    if (propertyType) {
      andFilters.push({ propertyType });
    }

    if (interiorStatus) {
      andFilters.push({ interiorStatus: new RegExp(escapeRegex(interiorStatus), "i") });
    }

    if (allowPets !== undefined) {
      andFilters.push({ allowPets });
    }

    if (curfewFree !== undefined) {
      andFilters.push({ "details.curfewFree": curfewFree });
    }

    if (minBedrooms !== undefined) {
      andFilters.push({ bedrooms: { $gte: minBedrooms } });
    }

    if (minBathrooms !== undefined) {
      andFilters.push({ bathrooms: { $gte: minBathrooms } });
    }

    const parsedPriceRanges = priceRanges
      .map((range) => parseRange(range))
      .filter((range): range is RangeFilter => range !== null);

    if (parsedPriceRanges.length) {
      const priceOrFilters = parsedPriceRanges
        .map((range) => buildNumberRangeFilter("price", range))
        .filter(Boolean);

      if (priceOrFilters.length) {
        andFilters.push({ $or: priceOrFilters });
      }
    } else if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter = buildNumberRangeFilter("price", {
        min: minPrice,
        max: maxPrice,
      });

      if (priceFilter) {
        andFilters.push(priceFilter);
      }
    }

    const parsedAreaRanges = areaRanges
      .map((range) => parseRange(range))
      .filter((range): range is RangeFilter => range !== null);

    if (parsedAreaRanges.length) {
      const areaOrFilters = parsedAreaRanges
        .map((range) => buildAreaRangeFilter(range))
        .filter(Boolean);

      if (areaOrFilters.length) {
        andFilters.push({ $or: areaOrFilters });
      }
    } else if (minArea !== undefined || maxArea !== undefined) {
      const areaFilter = buildAreaRangeFilter({ min: minArea, max: maxArea });

      if (areaFilter) {
        andFilters.push(areaFilter);
      }
    }

    if (amenities.length) {
      amenities.forEach((amenity) => {
        const field = AMENITY_FIELD_MAP[amenity];

        if (field) {
          andFilters.push({ [`details.${field}`]: true });
        }
      });
    }

    if (
      latitude !== undefined &&
      longitude !== undefined &&
      radiusKm !== undefined &&
      radiusKm > 0
    ) {
      andFilters.push({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            $maxDistance: radiusKm * 1000,
          },
        },
      });
    }

    const query = andFilters.length === 1 ? andFilters[0] : { $and: andFilters };

    await connectDB();

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("ownerId", "fullName phone avatarUrl responseRate")
        .lean<RoomPostDocument[]>(),
      Post.countDocuments(query),
    ]);

    const rooms = posts.map((post) => mapPostToRoomDetail(serializePost(post)));

    return NextResponse.json({
      success: true,
      message: "Room search fetched",
      data: rooms,
      meta: {
        page,
        limit,
        total,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        data: [],
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
