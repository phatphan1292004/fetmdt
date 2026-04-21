import { connectDB } from "@/src/lib/mongoose";
import Location from "@/src/models/Location";
import { NextResponse } from "next/server";

type HeaderLocation = {
  city: string;
  districts: string[];
};

export async function GET() {
  try {
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

    const locations: HeaderLocation[] = locationDocs
      .map((location) => ({
        city: location.city.trim(),
        districts: location.districts
          .map((district) => district.trim())
          .filter((district) => district.length > 0),
      }))
      .filter((location) => location.city.length > 0);

    return NextResponse.json({
      success: true,
      data: locations,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        data: [],
      },
      { status: 500 }
    );
  }
}