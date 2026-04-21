import { connectDB } from "@/src/lib/mongoose";
import Location from "@/src/models/Location";
import { NextResponse } from "next/server";

type HeaderLocation = {
  city: string;
  districts: string[];
};

const FALLBACK_LOCATIONS: readonly HeaderLocation[] = [
  { city: "Hồ Chí Minh", districts: [] },
  { city: "Hà Nội", districts: [] },
];

function normalizeLocationData(locations: Array<{ city?: string; districts?: string[] }>): HeaderLocation[] {
  return locations
    .map((location) => ({
      city: (location.city ?? "").trim(),
      districts: (location.districts ?? [])
        .map((district) => district.trim())
        .filter((district) => district.length > 0),
    }))
    .filter((location) => location.city.length > 0);
}

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        success: true,
        data: FALLBACK_LOCATIONS,
      });
    }

    await connectDB();

    const locationDocs = await Location.find(
      {},
      {
        _id: 0,
        city: 1,
        districts: 1,
      }
    )
      .sort({ city: 1 })
      .lean();

    const locations = normalizeLocationData(locationDocs);

    return NextResponse.json({
      success: true,
      data: locations.length ? locations : FALLBACK_LOCATIONS,
    });
  } catch {
    return NextResponse.json(
      {
        success: true,
        data: FALLBACK_LOCATIONS,
      },
      { status: 200 }
    );
  }
}