"use client";

import { useState } from "react";
import { IoCheckmarkCircleOutline, IoPrintOutline, IoEyeOutline } from "react-icons/io5";

type HandoverItem = {
  category: string;
  name: string;
  status: "Tốt" | "Hỏng nhẹ" | "Cần sửa chữa";
  note: string;
};

type HandoverRecord = {
  id: string;
  roomName: string;
  landlord: string;
  renter: string;
  date: string;
  items: HandoverItem[];
};

const MOCK_HANDOVERS: HandoverRecord[] = [
  {
    id: "BBBG-2026-102",
    roomName: "Phòng 102 - Nhà trọ Linh Trung",
    landlord: "Nguyễn Văn A",
    renter: "Nguyễn Văn B (Bạn)",
    date: "01/01/2026",
    items: [
      { category: "Cửa & Khóa", name: "Cửa chính & Khóa", status: "Tốt", note: "Hoạt động trơn tru" },
      { category: "Cửa & Khóa", name: "Cửa sổ & Chốt khóa", status: "Tốt", note: "" },
      { category: "Thiết bị điện", name: "Hệ thống đèn chiếu sáng", status: "Tốt", note: "" },
      { category: "Thiết bị điện", name: "Ổ cắm & Công tắc", status: "Tốt", note: "" },
      { category: "Thiết bị điện", name: "Máy lạnh & Remote", status: "Hỏng nhẹ", note: "Remote hơi liệt nút nguồn, máy lạnh làm lạnh nhanh" },
      { category: "Hệ thống nước", name: "Bồn cầu & Vòi xịt", status: "Tốt", note: "" },
      { category: "Hệ thống nước", name: "Vòi sen & Hệ thống thoát nước", status: "Tốt", note: "" },
      { category: "Tường & Trần", name: "Sơn tường & Trần nhà", status: "Hỏng nhẹ", note: "Có vết ố nhỏ ở góc tường cạnh cửa sổ" },
      { category: "Tường & Trần", name: "Gạch lát nền", status: "Tốt", note: "" },
      { category: "Nội thất", name: "Tủ quần áo", status: "Tốt", note: "" },
      { category: "Nội thất", name: "Giường ngủ", status: "Tốt", note: "" },
    ],
  },
];

export function HandoverViewTab() {
  const [selectedRecord, setSelectedRecord] = useState<HandoverRecord | null>(MOCK_HANDOVERS[0]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Lịch Sử Bàn Giao & Hiện Trạng</h2>
            <p className="mt-1 text-slate-600 text-[15px]">
              Tra cứu biên bản hiện trạng phòng trọ được xác nhận bởi bạn và chủ nhà tại thời điểm bàn giao phòng.
            </p>
          </div>
          {selectedRecord && (
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white transition hover:bg-slate-800 shadow-sm"
            >
              <IoPrintOutline className="h-5 w-5" /> In biên bản bàn giao
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 print:block print:w-full">
        {/* Left Side: Handover list logs (1 col) - hidden on print */}
        <section className="lg:col-span-1 space-y-4 print:hidden">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              Danh sách biên bản
            </h3>
            <div className="space-y-2.5">
              {MOCK_HANDOVERS.map((record) => {
                const isSelected = selectedRecord?.id === record.id;
                const badCount = record.items.filter((item) => item.status !== "Tốt").length;

                return (
                  <button
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    type="button"
                    className={`w-full text-left p-4 rounded-xl border transition flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#effaff] border-[#0b7ea9] shadow-sm"
                        : "bg-white border-slate-150 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="font-bold text-slate-950 text-sm">{record.roomName}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md">
                        {record.id}
                      </span>
                    </div>
                    <div className="mt-2.5 text-xs text-slate-500 flex justify-between w-full">
                      <span>Ngày bàn giao: {record.date}</span>
                      <span className={badCount > 0 ? "text-amber-600 font-semibold" : "text-emerald-600"}>
                        {badCount > 0 ? `${badCount} thiết bị lỗi/hỏng` : "100% tốt"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right Side: Read-only Sheet (2 cols) */}
        <section className="lg:col-span-2 print:w-full">
          {selectedRecord ? (
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:border-none print:shadow-none print:p-0">
              {/* Header */}
              <div className="text-center space-y-1 mb-6 border-b border-slate-100 pb-5">
                <h1 className="text-xl font-extrabold text-slate-900 uppercase">
                  Biên Bản Bàn Giao Thiết Bị Trực Tuyến
                </h1>
                <p className="text-xs text-slate-400 italic">Mã số: {selectedRecord.id} • Ngày ký kết: {selectedRecord.date}</p>
              </div>

              {/* Handover Details */}
              <div className="grid gap-4 sm:grid-cols-2 text-sm mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 print:bg-none print:border-none print:p-0">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Bên bàn giao (Bên A)</p>
                  <p className="font-bold text-slate-900">{selectedRecord.landlord}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Bên tiếp nhận (Bên B)</p>
                  <p className="font-bold text-slate-900">{selectedRecord.renter}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Địa điểm phòng trọ</p>
                  <p className="font-bold text-slate-800">{selectedRecord.roomName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Ngày bắt đầu hiệu lực</p>
                  <p className="font-bold text-slate-800">{selectedRecord.date}</p>
                </div>
              </div>

              {/* Equipment Grid List */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 print:bg-none">
                    <tr className="font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Danh mục</th>
                      <th className="py-2.5 px-3">Tên thiết bị</th>
                      <th className="py-2.5 px-3 w-28 text-center">Trạng thái</th>
                      <th className="py-2.5 px-3">Ghi chú hiện trạng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {selectedRecord.items.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-slate-400 font-medium">{item.category}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{item.name}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                              item.status === "Tốt"
                                ? "bg-emerald-100 text-emerald-800"
                                : item.status === "Hỏng nhẹ"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 italic">{item.note || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures for Print */}
              <div className="hidden print:grid grid-cols-2 gap-8 text-center mt-12 font-medium text-xs">
                <div>
                  <p className="italic">Biên bản lập ngày {selectedRecord.date}</p>
                  <p className="font-bold uppercase mt-1">Đại diện Bên A (Đã ký)</p>
                  <p className="text-slate-800 font-bold mt-8">{selectedRecord.landlord}</p>
                </div>
                <div>
                  <p className="italic">&nbsp;</p>
                  <p className="font-bold uppercase mt-1">Đại diện Bên B (Đã ký)</p>
                  <p className="text-slate-800 font-bold mt-8">{selectedRecord.renter}</p>
                </div>
              </div>
            </article>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-400 text-sm h-full flex flex-col items-center justify-center print:hidden">
              Chọn một biên bản để xem chi tiết.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
