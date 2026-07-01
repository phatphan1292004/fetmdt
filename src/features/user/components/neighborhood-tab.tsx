"use client";

import { useState } from "react";
import { IoMapOutline, IoBusOutline, IoCartOutline, IoMedicalOutline, IoShieldCheckmarkOutline } from "react-icons/io5";

type UtilityInfo = {
  name: string;
  distance: string;
  note: string;
};

type ZoneData = {
  id: string;
  name: string;
  mapQuery: string;
  busStations: UtilityInfo[];
  markets: UtilityInfo[];
  hospitals: UtilityInfo[];
  security: UtilityInfo[];
  safetyTip: string;
};

const ZONES: ZoneData[] = [
  {
    id: "nong_lam",
    name: "Đại học Nông Lâm TP.HCM (Thủ Đức)",
    mapQuery: "Đại học Nông Lâm TP.HCM, Linh Trung, Thủ Đức",
    busStations: [
      { name: "Trạm xe buýt Cổng trường Nông Lâm (Tuyến 104, 19, 33)", distance: "50m", note: "Nhiều chuyến đi thẳng vào trung tâm thành phố." },
      { name: "Trạm Suối Tiên (Xa lộ Hà Nội)", distance: "500m", note: "Có cầu vượt bộ hành qua đường an toàn." }
    ],
    markets: [
      { name: "Chợ đêm sinh viên Nông Lâm", distance: "200m", note: "Bán đồ ăn vặt, quần áo giá rẻ từ 16h - 22h hàng ngày." },
      { name: "Siêu thị Co.op Extra Linh Trung", distance: "1.2km", note: "Nằm trong trung tâm thương mại Sense City." }
    ],
    hospitals: [
      { name: "Trạm y tế Đại học Nông Lâm", distance: "100m", note: "Nằm ngay trong khuôn viên trường." },
      { name: "Bệnh viện Đa khoa khu vực Thủ Đức", distance: "2.5km", note: "Địa chỉ: 29 Phú Châu, Tam Phú, Thủ Đức." }
    ],
    security: [
      { name: "Công an Phường Linh Trung", distance: "1.5km", note: "Khu vực an ninh tốt, hay có tuần tra ban đêm." }
    ],
    safetyTip: "Khu vực cổng sau Nông Lâm và đường số 17 Linh Trung có nhiều hẻm trọ giá tốt, nhưng tránh đi lại đêm muộn ở các đoạn đường vắng thiếu ánh sáng."
  },
  {
    id: "dh_quoc_gia",
    name: "Khu đô thị Đại học Quốc gia TP.HCM (Làng Đại học)",
    mapQuery: "Đại học Quốc gia TP.HCM, Đông Hòa, Dĩ An",
    busStations: [
      { name: "Trạm xe buýt Nhà văn hóa Sinh viên ĐHQG (Tuyến 52, 19, 33, 50)", distance: "100m", note: "Trạm trung chuyển lớn nhất Làng Đại học." },
      { name: "Ga Metro Đại học Quốc gia", distance: "1.5km", note: "Thuận tiện di chuyển vào trung tâm thành phố." }
    ],
    markets: [
      { name: "Chợ đêm Làng Đại học mới", distance: "300m", note: "Thiên đường mua sắm và ẩm thực giá rẻ của sinh viên." },
      { name: "Cửa hàng tiện lợi GS25 / Circle K (Khu đô thị ĐHQG)", distance: "150m", note: "Hoạt động 24/7 xung quanh các ký túc xá." }
    ],
    hospitals: [
      { name: "Trung tâm Y tế Đại học Quốc gia TP.HCM", distance: "400m", note: "Khám chữa bệnh thẻ bảo hiểm y tế sinh viên." },
      { name: "Bệnh viện Đa khoa Hoàn Hảo (Dĩ An)", distance: "1.8km", note: "Phòng khám uy tín gần Làng Đại học." }
    ],
    security: [
      { name: "Đồn Công an Làng Đại học (Đông Hòa)", distance: "500m", note: "Có chốt trực và lực lượng tuần tra 24/24." }
    ],
    safetyTip: "An ninh Làng Đại học đã cải thiện rất nhiều nhờ hệ thống camera và đồn công an mới, tuy nhiên vẫn cần bảo quản kỹ tài sản cá nhân nơi đông người."
  },
  {
    id: "bach_khoa",
    name: "Đại học Bách Khoa TP.HCM (Quận 10)",
    mapQuery: "Đại học Bách Khoa TP.HCM, Lý Thường Kiệt, Quận 10",
    busStations: [
      { name: "Trạm dừng Lý Thường Kiệt (Tuyến 8, 59, 94)", distance: "80m", note: "Nằm ngay trước cổng chính Đại học Bách Khoa." },
      { name: "Trạm Tô Hiến Thành (Tuyến 38)", distance: "120m", note: "Thuận tiện di chuyển hướng Quận 1, Quận 3." }
    ],
    markets: [
      { name: "Chợ Nguyễn Tri Phương", distance: "800m", note: "Chợ dân sinh bán nhiều nhu yếu phẩm tươi ngon." },
      { name: "Siêu thị Co.opmart Lý Thường Kiệt", distance: "400m", note: "Nằm tại ngã tư Lý Thường Kiệt - Ba Tháng Hai." }
    ],
    hospitals: [
      { name: "Bệnh viện Trưng Vương", distance: "300m", note: "Nằm đối diện cổng trường đường Tô Hiến Thành." },
      { name: "Bệnh viện Chợ Rẫy", distance: "1.2km", note: "Bệnh viện tuyến cuối lớn nhất khu vực phía Nam." }
    ],
    security: [
      { name: "Công an Phường 14, Quận 10", distance: "600m", note: "Địa chỉ: 324 Lý Thường Kiệt, Quận 10." }
    ],
    safetyTip: "Khu vực trung tâm Quận 10 rất sầm uất và an ninh tốt, tuy nhiên giá thuê trọ thường cao và diện tích phòng nhỏ hơn khu ngoại thành."
  }
];

export function NeighborhoodTab() {
  const [selectedZoneId, setSelectedZoneId] = useState<string>(ZONES[0].id);

  const selectedZone = ZONES.find((z) => z.id === selectedZoneId) || ZONES[0];

  const mapIframeUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    selectedZone.mapQuery
  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="space-y-6">
      {/* Intro card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Bản đồ Tiện ích & Gợi ý Sinh hoạt</h2>
            <p className="mt-1 text-slate-600 text-[15px]">
              Tra cứu nhanh các thông tin tiện ích dân sinh thiết yếu xung quanh các trường Đại học lớn.
            </p>
          </div>

          {/* Select dropdown */}
          <div className="w-72">
            <select
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              className="w-full h-11 bg-[#f5f7fa] border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0b7ea9] transition text-slate-800 font-bold"
            >
              {ZONES.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid: Map and details */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Google Maps Embed iframe (3 cols) */}
        <section className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm h-[480px]">
          <iframe
            src={mapIframeUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            title={`Bản đồ ${selectedZone.name}`}
            className="w-full h-full"
          />
        </section>

        {/* Utilities info list (2 cols) */}
        <section className="lg:col-span-2 space-y-4 max-h-[480px] overflow-y-auto pr-1">
          {/* Safety tips badge */}
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 text-teal-900 flex gap-2.5 text-xs">
            <IoShieldCheckmarkOutline className="h-5 w-5 shrink-0 text-teal-600 mt-0.5" />
            <div>
              <span className="font-bold">Mẹo an toàn khu vực:</span>
              <p className="mt-0.5 text-slate-600 leading-relaxed">{selectedZone.safetyTip}</p>
            </div>
          </div>

          {/* Bus stations */}
          <article className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
            <h4 className="font-bold text-slate-800 text-[14px] flex items-center gap-2 border-b border-slate-100 pb-1.5 mb-2.5">
              <IoBusOutline className="text-blue-500 h-4.5 w-4.5" /> Trạm xe buýt gần nhất
            </h4>
            <div className="space-y-3">
              {selectedZone.busStations.map((item, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-700">
                    <span>{item.name}</span>
                    <span className="text-blue-600 shrink-0">~ {item.distance}</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">{item.note}</p>
                </div>
              ))}
            </div>
          </article>

          {/* Markets */}
          <article className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
            <h4 className="font-bold text-slate-800 text-[14px] flex items-center gap-2 border-b border-slate-100 pb-1.5 mb-2.5">
              <IoCartOutline className="text-emerald-500 h-4.5 w-4.5" /> Chợ & Mua sắm
            </h4>
            <div className="space-y-3">
              {selectedZone.markets.map((item, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-700">
                    <span>{item.name}</span>
                    <span className="text-emerald-600 shrink-0">~ {item.distance}</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">{item.note}</p>
                </div>
              ))}
            </div>
          </article>

          {/* Medical */}
          <article className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
            <h4 className="font-bold text-slate-800 text-[14px] flex items-center gap-2 border-b border-slate-100 pb-1.5 mb-2.5">
              <IoMedicalOutline className="text-rose-500 h-4.5 w-4.5" /> Y tế & Cứu trợ khẩn cấp
            </h4>
            <div className="space-y-3">
              {selectedZone.hospitals.map((item, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-700">
                    <span>{item.name}</span>
                    <span className="text-rose-600 shrink-0">~ {item.distance}</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">{item.note}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
