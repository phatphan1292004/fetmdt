"use client";

import { useState } from "react";
import { IoAddOutline, IoTrashOutline, IoPrintOutline, IoCheckmarkCircleOutline } from "react-icons/io5";

type HandoverItem = {
  category: string;
  name: string;
  status: "Tốt" | "Hỏng nhẹ" | "Cần sửa chữa";
  note: string;
};

const DEFAULT_ITEMS: HandoverItem[] = [
  { category: "Cửa & Khóa", name: "Cửa chính & Khóa", status: "Tốt", note: "" },
  { category: "Cửa & Khóa", name: "Cửa sổ & Chốt khóa", status: "Tốt", note: "" },
  { category: "Thiết bị điện", name: "Hệ thống đèn chiếu sáng", status: "Tốt", note: "" },
  { category: "Thiết bị điện", name: "Ổ cắm & Công tắc", status: "Tốt", note: "" },
  { category: "Thiết bị điện", name: "Máy lạnh & Remote", status: "Tốt", note: "" },
  { category: "Hệ thống nước", name: "Bồn cầu & Vòi xịt", status: "Tốt", note: "" },
  { category: "Hệ thống nước", name: "Vòi sen & Hệ thống thoát nước", status: "Tốt", note: "" },
  { category: "Tường & Trần", name: "Sơn tường & Trần nhà", status: "Tốt", note: "" },
  { category: "Tường & Trần", name: "Gạch lát nền", status: "Tốt", note: "" },
  { category: "Nội thất", name: "Tủ quần áo", status: "Tốt", note: "" },
  { category: "Nội thất", name: "Giường ngủ", status: "Tốt", note: "" },
];

export function HandoverTab() {
  const [landlord, setLandlord] = useState("");
  const [renter, setRenter] = useState("");
  const [address, setAddress] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState<HandoverItem[]>(DEFAULT_ITEMS);

  // For adding a custom item
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Thiết bị khác");

  const handleStatusChange = (index: number, status: HandoverItem["status"]) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, status } : item))
    );
  };

  const handleNoteChange = (index: number, note: string) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, note } : item))
    );
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        category: newItemCategory,
        name: newItemName.trim(),
        status: "Tốt",
        note: "",
      },
    ]);
    setNewItemName("");
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Nhật Ký Bàn Giao Phòng Trọ</h2>
            <p className="mt-1 text-slate-600 text-[15px]">
              Ghi nhận tình trạng cơ sở vật chất phòng lúc nhận bàn giao để đối chiếu khi dọn đi.
            </p>
          </div>
          <button
            onClick={handlePrint}
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white transition hover:bg-slate-800 shadow-sm"
          >
            <IoPrintOutline className="h-5 w-5" /> In biên bản bàn giao
          </button>
        </div>
      </div>

      {/* Main Handover Sheet */}
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Printable Header */}
        <div className="text-center space-y-1 mb-6 border-b border-slate-100 pb-5">
          <h1 className="text-2xl font-extrabold text-slate-900 uppercase">Biên Bản Bàn Giao Trang Thiết Bị Phòng Trọ</h1>
          <p className="text-sm text-slate-500 italic print:block">Hệ thống Stayvia - Hỗ trợ bảo vệ quyền lợi người thuê trọ</p>
        </div>

        {/* Handover Details */}
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Bên giao (Chủ trọ / Đại diện)
              </label>
              <input
                type="text"
                placeholder="Nhập tên chủ trọ..."
                value={landlord}
                onChange={(e) => setLandlord(e.target.value)}
                className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9] print:border-none print:p-0 print:font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Bên nhận (Người thuê trọ)
              </label>
              <input
                type="text"
                placeholder="Nhập tên người thuê..."
                value={renter}
                onChange={(e) => setRenter(e.target.value)}
                className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9] print:border-none print:p-0 print:font-semibold"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Địa chỉ khu trọ
              </label>
              <input
                type="text"
                placeholder="Nhập địa chỉ nhà trọ..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9] print:border-none print:p-0 print:font-semibold"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Mã số phòng
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: P102"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9] print:border-none print:p-0 print:font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Ngày bàn giao
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9] print:border-none print:p-0 print:font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Handover List Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl print:border-slate-300">
          <table className="w-full min-w-[640px] text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 print:bg-none print:border-slate-300">
              <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3 w-1/4">Danh mục</th>
                <th className="px-4 py-3 w-1/3">Tên thiết bị</th>
                <th className="px-4 py-3 text-center print:text-left print:w-20">Trạng thái</th>
                <th className="px-4 py-3 print:w-1/3">Ghi chú chi tiết</th>
                <th className="px-4 py-3 text-center print:hidden w-16">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-slate-200 text-sm">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50/50 print:hover:bg-none">
                  <td className="px-4 py-3 text-slate-500 font-medium">{item.category}</td>
                  <td className="px-4 py-3 text-slate-900 font-bold">{item.name}</td>
                  <td className="px-4 py-3 text-center print:text-left">
                    {/* Status selection (hidden on print) */}
                    <div className="inline-flex rounded-xl p-0.5 bg-slate-100 border border-slate-200/50 print:hidden text-xs">
                      {(["Tốt", "Hỏng nhẹ", "Cần sửa chữa"] as const).map((st) => {
                        const isSelected = item.status === st;
                        let activeColor = "bg-white text-slate-800 shadow-sm font-bold";
                        if (isSelected) {
                          if (st === "Tốt") activeColor = "bg-emerald-500 text-white shadow-sm font-bold";
                          if (st === "Hỏng nhẹ") activeColor = "bg-amber-500 text-white shadow-sm font-bold";
                          if (st === "Cần sửa chữa") activeColor = "bg-red-500 text-white shadow-sm font-bold";
                        }

                        return (
                          <button
                            key={st}
                            onClick={() => handleStatusChange(index, st)}
                            type="button"
                            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                              isSelected ? activeColor : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                    {/* Print representation */}
                    <span className="hidden print:inline font-bold">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      placeholder="Nhập tình trạng chi tiết nếu hỏng..."
                      value={item.note}
                      onChange={(e) => handleNoteChange(index, e.target.value)}
                      className="w-full bg-transparent border-b border-transparent focus:border-[#0b7ea9] outline-none text-slate-700 py-0.5 print:border-none print:placeholder-transparent"
                    />
                  </td>
                  <td className="px-4 py-3 text-center print:hidden">
                    <button
                      onClick={() => handleRemoveItem(index)}
                      type="button"
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      title="Xóa thiết bị"
                    >
                      <IoTrashOutline className="h-4.5 w-4.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Custom Item Adding - (hidden on print) */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/50 flex flex-wrap items-end gap-3 print:hidden">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-500 mb-1.5">
              Thêm thiết bị tùy chỉnh ngoài danh mục mặc định
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Bình nước nóng Ariston, Tủ lạnh mini..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full h-10 bg-white border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9]"
            />
          </div>

          <div className="w-48">
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Phân nhóm</label>
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="w-full h-10 bg-white border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9] text-slate-700"
            >
              <option value="Thiết bị khác">Thiết bị khác</option>
              <option value="Thiết bị điện">Thiết bị điện</option>
              <option value="Hệ thống nước">Hệ thống nước</option>
              <option value="Nội thất">Nội thất</option>
              <option value="Cửa & Khóa">Cửa & Khóa</option>
            </select>
          </div>

          <button
            onClick={handleAddItem}
            type="button"
            className="h-10 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <IoAddOutline className="h-5 w-5" /> Thêm thiết bị
          </button>
        </div>

        {/* Printable Signature Block */}
        <div className="hidden print:grid grid-cols-2 gap-12 text-center mt-12 font-medium">
          <div>
            <p className="italic">Hà Nội, ngày ..... tháng ..... năm 202...</p>
            <p className="font-bold uppercase mt-1">Đại diện Bên Giao (Bên A)</p>
            <p className="text-slate-400 text-xs mt-12">(Ký, ghi rõ họ tên)</p>
          </div>
          <div>
            <p className="italic">&nbsp;</p>
            <p className="font-bold uppercase mt-1">Đại diện Bên Nhận (Bên B)</p>
            <p className="text-slate-400 text-xs mt-12">(Ký, ghi rõ họ tên)</p>
          </div>
        </div>
      </article>

      {/* Safety Notice Card - (hidden on print) */}
      <div className="rounded-2xl bg-amber-50/50 border border-amber-200/60 p-4 flex gap-3 text-sm text-amber-800 print:hidden">
        <IoCheckmarkCircleOutline className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
        <div>
          <span className="font-bold">Mẹo hay khi nhận bàn giao:</span> Hãy đối chiếu thực tế từng thiết bị điện,
          bình nước nóng, điều hòa, đồng thời quay video toàn cảnh phòng trọ lúc dọn vào làm bằng chứng đối chiếu. 
          Bạn có thể nhấn nút <span className="font-bold">"In biên bản bàn giao"</span> để in ra giấy hoặc lưu thành file PDF ký tay cùng chủ trọ.
        </div>
      </div>
    </div>
  );
}
