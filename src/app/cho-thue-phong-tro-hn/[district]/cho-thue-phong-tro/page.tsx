import { RoomDetailPage, getRelatedRooms, getRoomDetailByRoute } from "@/src/features/room";
import { notFound } from "next/navigation";

type RoomDetailRoutePageProps = {
  params: Promise<{
    district: string;
    slug: string;
  }>;
};

export default async function RoomDetailRoutePage({ params }: RoomDetailRoutePageProps) {
  const { district, slug } = await params;
  const room = getRoomDetailByRoute(district, slug);

  if (!room) {
    notFound();
  }

  const relatedRooms = getRelatedRooms(room.id, 4);

  return <RoomDetailPage room={room} relatedRooms={relatedRooms} />;
}
