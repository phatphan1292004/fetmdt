"use client";

import { use, useEffect, useState } from "react";
import { RoomDetailPage } from "@/src/features/room";
import type { RoomDetailData } from "@/src/features/room";

type RoomDetailRoutePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type RoomApiResponse = {
  success: boolean;
  message?: string;
  data: RoomDetailData | null;
};

export default function RoomDetailRoutePage({
  params,
}: RoomDetailRoutePageProps) {
  const { slug } = use(params);
  const [room, setRoom] = useState<RoomDetailData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!slug?.trim()) {
      return;
    }

    let isMounted = true;

    const loadRoomDetail = async () => {
      try {
        setErrorMessage(null);
        const response = await fetch(
          `/api/v1/rooms?slug=${encodeURIComponent(slug.trim())}`,
        );
        const result = (await response.json()) as RoomApiResponse;

        if (!response.ok || !result.success || !result.data) {
          if (isMounted) {
            setErrorMessage(result.message ?? "Không tìm thấy phòng");
          }
          return;
        }

        if (!isMounted) {
          return;
        }

        setRoom(result.data);
      } catch (error) {
        if (isMounted) {
          setErrorMessage("Không thể tải dữ liệu phòng");
        }
      }
    };

    loadRoomDetail();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (errorMessage) {
    return (
      <main className="flex-1 bg-[#f5f7f9]">
        <div className="mx-auto w-full max-w-400 px-4 py-12 text-center text-slate-600">
          {errorMessage}
        </div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="flex-1 bg-[#f5f7f9]">
        <div className="mx-auto w-full max-w-400 px-4 py-12 text-center text-slate-600">
          Đang tải dữ liệu...
        </div>
      </main>
    );
  }

  return <RoomDetailPage room={room} relatedRooms={[]} />;
}
