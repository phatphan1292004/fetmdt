"use client";

import Link from "next/link";
import { useState } from "react";
import { buildRoomRouteFromSlug } from "../servers";
import type { RoomDetailData } from "../types";
import { SaveRoomButton } from "./save-room-button";

const SUGGESTIONS = [
  "Tìm phòng trọ Thủ Đức dưới 3 triệu, có máy lạnh và gác lửng",
  "Căn hộ chung cư quận Bình Thạnh tầm 6 triệu nuôi được thú cưng",
  "Tìm phòng trọ dưới 2 triệu gần Đại học Nông Lâm tự do giờ giấc",
  "Tìm nhà nguyên căn giá dưới 10 triệu có chỗ để xe và ban công",
];

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  let inList = false;
  const listItems: React.ReactNode[] = [];
  const elements: React.ReactNode[] = [];

  const parseInline = (str: string) => {
    const parts = str.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-bold text-slate-900">{part}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("### ")) {
      if (inList) {
        elements.push(<ul key={`list-${index}`} className="list-disc pl-5 my-2 space-y-1">{[...listItems]}</ul>);
        listItems.length = 0;
        inList = false;
      }
      elements.push(<h3 key={index} className="text-base font-bold text-slate-900 mt-3 mb-1">{parseInline(trimmed.slice(4))}</h3>);
      return;
    }
    if (trimmed.startsWith("## ")) {
      if (inList) {
        elements.push(<ul key={`list-${index}`} className="list-disc pl-5 my-2 space-y-1">{[...listItems]}</ul>);
        listItems.length = 0;
        inList = false;
      }
      elements.push(<h2 key={index} className="text-lg font-bold text-slate-900 mt-4 mb-2">{parseInline(trimmed.slice(3))}</h2>);
      return;
    }
    if (trimmed.startsWith("# ")) {
      if (inList) {
        elements.push(<ul key={`list-${index}`} className="list-disc pl-5 my-2 space-y-1">{[...listItems]}</ul>);
        listItems.length = 0;
        inList = false;
      }
      elements.push(<h1 key={index} className="text-xl font-extrabold text-slate-900 mt-4 mb-2">{parseInline(trimmed.slice(2))}</h1>);
      return;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      inList = true;
      listItems.push(<li key={`li-${index}`} className="text-sm text-slate-700">{parseInline(trimmed.slice(2))}</li>);
      return;
    }

    if (!trimmed) {
      if (inList) {
        elements.push(<ul key={`list-${index}`} className="list-disc pl-5 my-2 space-y-1">{[...listItems]}</ul>);
        listItems.length = 0;
        inList = false;
      }
      elements.push(<div key={`br-${index}`} className="h-2" />);
      return;
    }

    if (inList) {
      elements.push(<ul key={`list-${index}`} className="list-disc pl-5 my-2 space-y-1">{[...listItems]}</ul>);
      listItems.length = 0;
      inList = false;
    }
    elements.push(<p key={index} className="text-sm md:text-base text-slate-700 leading-relaxed">{parseInline(line)}</p>);
  });

  if (inList) {
    elements.push(<ul key={`list-end`} className="list-disc pl-5 my-2 space-y-1">{[...listItems]}</ul>);
  }

  return <div className="space-y-1.5">{elements}</div>;
}

export function RoomSearchAIPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<RoomDetailData[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [showMap, setShowMap] = useState(true);

  const handleAISearch = async (textToSearch = prompt) => {
    if (!textToSearch.trim()) return;

    setLoading(true);
    setSearched(true);
    setRooms([]);
    setAiSummary(null);

    try {
      const res = await fetch("/api/v1/rooms/search-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToSearch }),
      });

      if (!res.ok) throw new Error("Search failed");
      const resData = await res.json();

      if (resData.success) {
        const matchedRooms = resData.data?.posts || [];
        setRooms(matchedRooms);
        setAiSummary(resData.aiResponse);
      }
    } catch (error) {
      console.error("AI search error:", error);
      setAiSummary("Đã xảy ra lỗi khi kết nối tới trợ lý AI. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const firstRoom = rooms[0];
  const mapUrl = firstRoom?.location?.latitude && firstRoom?.location?.longitude
    ? `https://maps.google.com/maps?q=${firstRoom.location.latitude},${firstRoom.location.longitude}&z=15&output=embed`
    : `https://maps.google.com/maps?q=Truong+Dai+Hoc+Nong+Lam+TPHCM&z=15&output=embed`;

  return (
    <div className="min-h-screen bg-[#f7fafc] py-12">
      <div className="mx-auto w-full max-w-4xl px-4">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0b7ea9] transition hover:text-[#096a8e] mb-6"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại Trang chủ
        </Link>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl bg-gradient-to-r from-[#0b7ea9] via-[#2cc3c8] to-[#045a84] bg-clip-text text-transparent">
            Tìm Kiếm Phòng Trọ Bằng AI
          </h1>
          <p className="mt-2 text-base text-slate-500 max-w-xl mx-auto">
            Nhập yêu cầu tìm phòng của bạn bằng ngôn ngữ tự nhiên thông thường, trợ lý AI sẽ tự động phân tích và tìm ra phòng phù hợp nhất.
          </p>
        </div>

        {/* Search Input Container */}
        <div className="rounded-3xl border border-white/60 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-md mb-8">
          <div className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ví dụ: Tôi muốn tìm phòng trọ tại Thủ Đức giá dưới 3 triệu, có gác lửng và cho phép nuôi thú cưng..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 pr-12 text-base text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0b7ea9] focus:bg-white"
            />
            <button
              onClick={() => handleAISearch()}
              disabled={loading || !prompt.trim()}
              className="absolute bottom-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0b7ea9] to-[#2cc3c8] text-white shadow-md transition hover:brightness-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              title="Tìm kiếm với AI"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>

          {/* Suggestions */}
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Gợi ý tìm kiếm:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(s);
                    handleAISearch(s);
                  }}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-[#8cd7db] hover:bg-[#effaff] hover:text-[#0b7ea9] text-left"
                >
                  ✨ {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="rounded-3xl border border-cyan-100 bg-cyan-50/30 p-8 text-center shadow-sm animate-pulse mb-8">
            <div className="flex flex-col items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-cyan-600 animate-spin">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18" />
                </svg>
              </span>
              <p className="text-base font-semibold text-cyan-800">Đang phân tích và tìm kiếm phòng trọ bằng AI...</p>
            </div>
          </div>
        )}

        {/* Results Block */}
        {!loading && searched && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* AI Answer Bubble with Left Avatar and White Background */}
            {aiSummary && (
              <div className="flex items-start gap-3 rounded-3xl bg-white p-5 border border-slate-200/60 shadow-xs">
                <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="flex-1 pt-0.5">
                  {renderMarkdown(aiSummary)}
                </div>
              </div>
            )}

            {/* Map Container */}
            {rooms.length > 0 && (
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm h-[320px]">
                {/* Segmented controls overlay */}
                <div className="absolute top-4 right-4 z-10 flex rounded-full bg-white p-1 shadow-[0_4px_12px_rgba(0,0,0,0.12)] border border-slate-100 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setShowMap(false)}
                    className={`rounded-full px-4 py-1.5 transition ${!showMap ? "bg-black text-white" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    Danh sách
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMap(true)}
                    className={`rounded-full px-4 py-1.5 transition ${showMap ? "bg-black text-white" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    Bản đồ
                  </button>
                </div>

                {showMap ? (
                  <iframe
                    src={mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    title="Bản đồ tìm kiếm"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-400 font-semibold text-sm">
                    Bản đồ đã được ẩn. Bạn có thể bật lại bằng nút góc trên.
                  </div>
                )}
              </div>
            )}

            {/* Room Listing Cards */}
            {rooms.length > 0 ? (
              <div className="space-y-4">
                {rooms.map((room, index) => {
                  const propertyTypeLabel = room.propertyType === "can_ho_chung_cu"
                    ? "Căn hộ"
                    : room.propertyType === "nha_o"
                      ? "Nhà ở"
                      : "Phòng trọ";

                  return (
                    <article
                      key={room.id}
                      className="relative overflow-hidden rounded-[24px] border border-slate-200/60 bg-slate-100/50 p-4 shadow-sm hover:shadow-md transition duration-200 flex flex-col md:flex-row gap-4"
                    >
                      <SaveRoomButton roomId={room.id} />

                      {/* Round Index Pin */}
                      <div className="absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-black text-white shadow-md">
                        {index + 1}
                      </div>

                      {/* Room Image */}
                      <div className="relative h-36 w-full md:w-36 shrink-0 overflow-hidden rounded-2xl bg-slate-200">
                        <div
                          className="h-full w-full bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${room.imageUrls[0] ||
                              "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500"
                              })`,
                          }}
                        />
                      </div>

                      {/* Content details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <Link
                            href={buildRoomRouteFromSlug(room.slug)}
                            className="text-lg font-bold text-slate-900 leading-snug hover:text-[#0b7ea9] transition"
                          >
                            {room.title}
                          </Link>

                          {/* Status and summary details line */}
                          <p className="mt-1 text-sm font-semibold text-emerald-600 flex items-center flex-wrap gap-1">
                            <span>Đang mở</span>
                            <span className="text-slate-300 mx-1">•</span>
                            <span>{propertyTypeLabel}</span>
                            <span className="text-slate-300 mx-1">•</span>
                            <span>{room.areaLabel}</span>
                            {room.location.districtLabel && (
                              <>
                                <span className="text-slate-300 mx-1">•</span>
                                <span className="text-slate-500 font-medium">({room.location.districtLabel})</span>
                              </>
                            )}
                          </p>

                          <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-2">
                            {room.description || room.subtitle}
                          </p>
                        </div>

                        {/* Origin Source Badge & Custom Buttons */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          {/* Custom Red-badge indicator */}

                          {/* Quick buttons matching the sample */}
                          <div className="flex gap-2">
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(room.address)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300"
                            >
                              Chỉ đường
                            </a>
                            <Link
                              href={buildRoomRouteFromSlug(room.slug)}
                              className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300"
                            >
                              Website
                            </Link>
                            <a
                              href={`tel:${room.contact.phone}`}
                              className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300"
                            >
                              Gọi
                            </a>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
                Không tìm thấy phòng nào phù hợp với yêu cầu hiện tại của bạn.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
