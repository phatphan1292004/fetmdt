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

const EARTH_RADIUS_KM = 6378.1;
const MAX_SEARCH_TERMS = 8;

const VIETNAMESE_CHAR_GROUPS = [
  "aàáảãạăằắẳẵặâầấẩẫậ",
  "eèéẻẽẹêềếểễệ",
  "iìíỉĩị",
  "oòóỏõọôồốổỗộơờớởỡợ",
  "uùúủũụưừứửữự",
  "yỳýỷỹỵ",
  "dđ",
] as const;

const LOCATION_STOP_WORDS = new Set([
  "phuong",
  "quan",
  "huyen",
  "thanh",
  "pho",
  "tp",
  "thi",
  "tran",
  "tinh",
  "viet",
  "nam",
]);

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

function toOptionalNumber(value: unknown, allowNegative = false): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || (!allowNegative && parsed < 0)) {
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
  const parsed = toOptionalNumber(value, true);

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

function escapeRegexClass(value: string): string {
  return value.replace(/[\\\]^]/g, "\\$&");
}

function buildVietnameseRegexClassMap(): Readonly<Record<string, string>> {
  const entries = VIETNAMESE_CHAR_GROUPS.flatMap((group) => {
    const chars = Array.from(new Set([...group, ...group.toUpperCase()]));
    const regexClass = `[${escapeRegexClass(chars.join(""))}]`;

    return chars.map((char) => [char.toLowerCase(), regexClass] as const);
  });

  return Object.fromEntries(entries);
}

const VIETNAMESE_REGEX_CLASS_BY_CHAR = buildVietnameseRegexClassMap();

function normalizeVietnamese(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

function buildAccentInsensitivePattern(value: string): string {
  return Array.from(value.normalize("NFC"))
    .map((char) => {
      if (/\s/.test(char)) {
        return "\\s+";
      }

      const regexClass = VIETNAMESE_REGEX_CLASS_BY_CHAR[char.toLowerCase()];

      if (regexClass) {
        return regexClass;
      }

      return escapeRegex(char);
    })
    .join("");
}

function cleanLocationPhrase(phrase: string): string {
  const cleaned = phrase
    .replace(/^(thành phố|thanh pho|tp\.?|quận|quan|q\.?|phường|phuong|p\.?|huyện|huyen|h\.?|tỉnh|tinh|thị xã|thi xa|tx\.?)\s+/i, "")
    .trim();
    
  if (cleaned.toLowerCase() === "việt nam" || cleaned.toLowerCase() === "viet nam") {
    return "";
  }
  
  return cleaned;
}

function buildSearchRegex(value: string): RegExp {
  let pattern = buildAccentInsensitivePattern(value);
  
  const normalizedValue = normalizeVietnamese(value);
  if (normalizedValue === "ho chi minh" || normalizedValue === "thanh pho ho chi minh") {
    pattern = `(${pattern}|tphcm|tp\\s*hcm|sài gòn|sai gon)`;
  }
  
  if (/\d+$/.test(value)) {
    pattern = `${pattern}\\b`;
  }
  if (/^\d+/.test(value)) {
    pattern = `\\b${pattern}`;
  }
  
  return new RegExp(pattern, "i");
}

function splitSearchTerms(value: string, options?: { removeLocationStopWords?: boolean }): string[] {
  const terms = value
    .split(/[,;|/]+/)
    .map((term) => term.trim())
    .filter(Boolean)
    .map((term) => (options?.removeLocationStopWords ? cleanLocationPhrase(term) : term))
    .filter(Boolean);

  return Array.from(new Set(terms)).slice(0, MAX_SEARCH_TERMS);
}

function buildTextSearchFilter(
  value: string,
  fields: readonly string[],
  options?: { removeLocationStopWords?: boolean }
): Record<string, unknown> | null {
  const terms = splitSearchTerms(value, options);

  if (!terms.length) {
    return null;
  }

  return {
    $and: terms.map((term) => {
      const regex = buildSearchRegex(term);

      return {
        $or: fields.map((field) => ({ [field]: regex })),
      };
    }),
  };
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
    const policies = searchParams.getAll("policies");
    const buildingAmenities = searchParams.getAll("buildingAmenities");
    const furniture = searchParams.getAll("furniture");
    const roomAmenities = searchParams.getAll("roomAmenities");

    const limit = normalizeLimit(searchParams.get("limit"));
    const page = normalizePage(searchParams.get("page"));
    const skip = (page - 1) * limit;

    const andFilters: Record<string, unknown>[] = [
      { status: { $in: PUBLIC_POST_STATUSES } },
    ];

    if (keyword) {
      const keywordFilter = buildTextSearchFilter(keyword, [
        "title",
        "description",
        "address",
        "projectName",
        "city",
        "district",
      ]);

      if (keywordFilter) {
        andFilters.push(keywordFilter);
      }
    }

    const hasRadiusSearch =
      latitude !== undefined &&
      longitude !== undefined &&
      radiusKm !== undefined &&
      radiusKm > 0;

    if (hasRadiusSearch) {
      andFilters.push({
        $or: [
          {
            location: {
              $geoWithin: {
                $centerSphere: [[longitude, latitude], radiusKm / EARTH_RADIUS_KM],
              },
            },
          },
          { location: { $exists: false } }
        ]
      });
    }

    if (locationText && !hasRadiusSearch) {
      const locationFilter = buildTextSearchFilter(
        locationText,
        ["address", "city", "district"],
        { removeLocationStopWords: true }
      );

      if (locationFilter) {
        andFilters.push(locationFilter);
      }
    }

    if (city) {
      const cityFilter = buildTextSearchFilter(city, ["city", "address"], {
        removeLocationStopWords: true,
      });

      if (cityFilter) {
        andFilters.push(cityFilter);
      }
    }

    if (district) {
      const districtFilter = buildTextSearchFilter(district, ["district", "address"], {
        removeLocationStopWords: true,
      });

      if (districtFilter) {
        andFilters.push(districtFilter);
      }
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

    if (policies.length) {
      policies.forEach((policy) => {
        if (policy === "pet-friendly") {
          andFilters.push({
            $or: [
              { allowPets: true },
              { "details.allowPets": true },
              {
                propertyType: { $in: ["can_ho_chung_cu", "nha_o"] },
                allowPets: { $ne: false },
                "details.allowPets": { $ne: false }
              }
            ]
          });
        } else if (policy === "free-hours") {
          andFilters.push({
            $or: [
              { "details.curfewFree": true },
              { propertyType: { $in: ["can_ho_chung_cu", "nha_o"] } }
            ]
          });
        } else if (policy === "owner-not-live") {
          andFilters.push({
            $or: [
              { propertyType: { $in: ["can_ho_chung_cu", "nha_o"] } },
              { "details.ownerNotLive": true },
              { "details.ownerNotLive": { $exists: false } }
            ]
          });
        }
      });
    }

    if (buildingAmenities.length) {
      buildingAmenities.forEach((amenity) => {
        if (amenity === "parking") {
          andFilters.push({
            $or: [
              { "details.hasParking": true },
              { propertyType: { $in: ["can_ho_chung_cu", "nha_o"] } }
            ]
          });
        } else if (amenity === "security-camera") {
          const regex = /camera|an\s*ninh|security/i;
          andFilters.push({
            $or: [
              { title: regex },
              { description: regex },
              { feature: regex },
              { propertyType: "can_ho_chung_cu" }
            ]
          });
        } else if (amenity === "security-24-7") {
          const regex = /bảo\s*vệ|bao\s*ve|24\/7|24h|an\s*ninh/i;
          andFilters.push({
            $or: [
              { title: regex },
              { description: regex },
              { feature: regex },
              { propertyType: "can_ho_chung_cu" }
            ]
          });
        }
      });
    }

    if (furniture && furniture.length) {
      furniture.forEach((item) => {
        if (item === "desk") {
          const regex = /bàn\s*làm\s*việc|ban\s*lam\s*viec|bàn\s*học|ban\s*hoc|desk/i;
          andFilters.push({
            $or: [
              { title: regex },
              { description: regex },
              { interiorStatus: regex },
              { "details.interiorStatus": regex }
            ]
          });
        } else if (item === "sofa") {
          const regex = /sofa|salon|sa\s*lon/i;
          andFilters.push({
            $or: [
              { title: regex },
              { description: regex },
              { interiorStatus: regex },
              { "details.interiorStatus": regex }
            ]
          });
        } else if (item === "dining-table") {
          const regex = /bàn\s*ăn|ban\s*an|dining/i;
          andFilters.push({
            $or: [
              { title: regex },
              { description: regex },
              { interiorStatus: regex },
              { "details.interiorStatus": regex }
            ]
          });
        }
      });
    }

    if (roomAmenities.length) {
      roomAmenities.forEach((amenity) => {
        if (amenity === "balcony") {
          const regex = /ban\s*công|ban\s*cong|balcony/i;
          andFilters.push({
            $or: [
              { "details.hasBalcony": true },
              { feature: /ban-cong|ban\s*công|ban\s*cong/i },
              { title: regex },
              { description: regex }
            ]
          });
        } else if (amenity === "loft") {
          const regex = /gác|gac|loft/i;
          andFilters.push({
            $or: [
              { "details.hasLoft": true },
              { title: regex },
              { description: regex }
            ]
          });
        } else if (amenity === "window") {
          const regex = /cửa\s*sổ|cua\s*so|window/i;
          andFilters.push({
            $or: [
              { title: regex },
              { description: regex },
              { feature: /cua-so|cửa\s*sổ|cua\s*so/i }
            ]
          });
        } else if (amenity === "smart-door-lock") {
          const regex = /khóa\s*thông\s*minh|khoa\s*thong\s*minh|khóa\s*từ|khoa\s*tu|vân\s*tay|van\s*tay|smart\s*lock/i;
          andFilters.push({
            $or: [
              { title: regex },
              { description: regex }
            ]
          });
        }
      });
    }

    const query = andFilters.length === 1 ? andFilters[0] : { $and: andFilters };

    await connectDB();

    // Sweep expired VIP packages
    await Post.updateMany(
      { vipExpireAt: { $lt: new Date() }, vipType: { $ne: "free" } },
      { $set: { vipType: "free", vipWeight: 0 } }
    );

    // Keep the geospatial index ready without failing the search when old data is malformed.
    try {
      await Post.createIndexes();
    } catch (indexError) {
      console.warn("Could not create indexes (possibly invalid geo data):", indexError);
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ vipWeight: -1, lastPushedAt: -1 })
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
    console.error("Room search error:", error);
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
