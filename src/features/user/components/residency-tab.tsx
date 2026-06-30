"use client";

import { useState } from "react";
import { IoCalendarOutline, IoDocumentTextOutline, IoLinkOutline, IoWarningOutline } from "react-icons/io5";

export function ResidencyTab() {
  const [moveInDate, setMoveInDate] = useState("");
  const [showCountdown, setShowCountdown] = useState(false);

  const calculateDaysRemaining = () => {
    if (!moveInDate) return null;
    const moveIn = new Date(moveInDate);
    const deadline = new Date(moveIn.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days deadline
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);

    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining();

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <h2 className="text-2xl font-extrabold text-slate-900">Hướng Dẫn Đăng Ký Tạm Trú</h2>
        <p className="mt-1.5 text-slate-600 text-[15px] leading-relaxed">
          Đăng ký tạm trú trong vòng 30 ngày kể từ khi chuyển vào phòng trọ mới là bắt buộc theo quy định của pháp luật nhằm đảm bảo quyền công dân và tránh bị phạt hành chính.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Countdown deadline helper */}
        <section className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <IoCalendarOutline className="text-[#0b7ea9] h-5 w-5" /> Hạn đăng ký tạm trú
            </h3>
            <p className="text-xs text-slate-500">
              Nhập ngày bạn bắt đầu dọn vào ở phòng trọ thực tế để tính toán thời hạn đăng ký hợp lệ.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ngày dọn vào phòng trọ</label>
              <input
                type="date"
                value={moveInDate}
                onChange={(e) => {
                  setMoveInDate(e.target.value);
                  setShowCountdown(true);
                }}
                className="w-full h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:border-[#0b7ea9] text-slate-700"
              />
            </div>

            {showCountdown && daysRemaining !== null && (
              <div className="pt-2">
                {daysRemaining > 0 ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Số ngày còn lại</p>
                    <p className="text-4xl font-black text-emerald-600 my-2">{daysRemaining} ngày</p>
                    <p className="text-xs text-emerald-800">
                      Hãy nhanh chóng chuẩn bị hồ sơ và đăng ký trước ngày{" "}
                      <span className="font-extrabold">
                        {new Date(new Date(moveInDate).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN")}
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-center animate-pulse">
                    <p className="text-xs text-red-600 font-bold uppercase tracking-wider">Đã quá hạn đăng ký</p>
                    <p className="text-4xl font-black text-red-600 my-2">{Math.abs(daysRemaining)} ngày</p>
                    <p className="text-xs text-red-800">
                      Bạn đã quá thời hạn 30 ngày đăng ký hợp pháp. Bạn có nguy cơ bị phạt hành chính từ 500.000đ - 1.000.000đ.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200/50 text-red-900 flex gap-2.5 text-xs">
            <IoWarningOutline className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
            <div>
              <span className="font-bold">Mức xử phạt hành chính:</span>
              <p className="mt-0.5 text-slate-600 leading-relaxed">
                Theo Nghị định 144/2021/NĐ-CP, việc không khai báo đăng ký tạm trú đúng hạn có thể bị phạt tiền từ{" "}
                <span className="font-bold text-red-600">500.000đ đến 1.000.000đ</span>. Nếu chuyển chỗ ở trọ mới mà vẫn
                không khai báo có thể bị phạt đến 2.000.000đ.
              </p>
            </div>
          </div>
        </section>

        {/* Right: Step-by-step roadmap */}
        <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
            Lộ trình đăng ký tạm trú (3 Bước)
          </h3>

          <div className="relative border-l border-slate-200 ml-3 pl-6 space-y-6">
            {/* Step 1 */}
            <div className="relative">
              <span className="absolute -left-[35px] top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#0b7ea9] text-white text-xs font-bold ring-4 ring-white">
                1
              </span>
              <div>
                <h4 className="font-bold text-slate-900 text-[15px]">Chuẩn bị hồ sơ pháp lý</h4>
                <p className="mt-1 text-slate-500 text-xs leading-relaxed">
                  Người đi đăng ký tạm trú cần chuẩn bị bản quét (scan)/chụp ảnh của các giấy tờ sau:
                </p>
                <ul className="mt-3.5 space-y-2 text-xs font-semibold text-slate-700">
                  <li className="flex items-center gap-2">
                    <IoDocumentTextOutline className="text-slate-400 h-4.5 w-4.5" />
                    <span>Hợp đồng thuê trọ hợp pháp (đã ký giữa bạn và chủ trọ).</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <IoDocumentTextOutline className="text-slate-400 h-4.5 w-4.5" />
                    <span>Chứng minh nhân dân / Căn cước công dân của bạn.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <IoDocumentTextOutline className="text-slate-400 h-4.5 w-4.5" />
                    <span>Bản khai thay đổi thông tin cư trú (Mẫu CT01 - ký xác nhận của chủ trọ).</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <span className="absolute -left-[35px] top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#0b7ea9] text-white text-xs font-bold ring-4 ring-white">
                2
              </span>
              <div>
                <h4 className="font-bold text-slate-900 text-[15px]">Nộp hồ sơ trực tuyến</h4>
                <p className="mt-1 text-slate-500 text-xs leading-relaxed">
                  Hiện nay Công an toàn quốc khuyến khích nộp online qua Cổng dịch vụ công của Bộ Công an.
                </p>
                <div className="mt-3">
                  <a
                    href="https://dichvucong.dancuquocgia.gov.vn"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#0b7ea9] px-3.5 text-xs font-bold text-[#0b7ea9] transition hover:bg-[#effaff]"
                  >
                    <IoLinkOutline className="h-4 w-4" /> Đi tới Cổng Dịch Vụ Công Bộ Công An
                  </a>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <span className="absolute -left-[35px] top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#0b7ea9] text-white text-xs font-bold ring-4 ring-white">
                3
              </span>
              <div>
                <h4 className="font-bold text-slate-900 text-[15px]">Thẩm định hồ sơ và Nhận kết quả</h4>
                <p className="mt-1 text-slate-500 text-xs leading-relaxed">
                  Trong thời hạn <span className="font-bold text-slate-800">03 ngày làm việc</span> kể từ ngày nhận đủ hồ sơ
                  hợp lệ, cơ quan Công an có trách nhiệm xét duyệt, cập nhật thông tin tạm trú mới của bạn vào Cơ sở dữ liệu về cư trú
                  và thông báo kết quả qua email hoặc SMS của bạn.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
