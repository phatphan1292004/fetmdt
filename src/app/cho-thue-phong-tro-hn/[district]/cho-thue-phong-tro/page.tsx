import { RoomListingPage, getDistrictLabelFromSlug, getRoomsByDistrict } from "@/src/features/room";
import { notFound } from "next/navigation";

type RoomListingRoutePageProps = {
  params: Promise<{
    district: string;
  }>;
};

export default async function RoomListingRoutePage({ params }: RoomListingRoutePageProps) {
  const { district } = await params;
  const rooms = getRoomsByDistrict(district);

  if (rooms.length === 0) {
    notFound();
  }

  const districtLabel = getDistrictLabelFromSlug(district);

  return <RoomListingPage districtLabel={districtLabel} rooms={rooms} />;
}
