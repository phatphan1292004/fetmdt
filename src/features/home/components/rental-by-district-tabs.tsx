"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { slugify } from "@/src/utils/slugify";

type CityId = "hcm" | "hn";

type DistrictCardData = {
  id: string;
  name: string;
  imageUrl: string;
  listingCountLabel: string;
};

type CityTabData = {
  id: CityId;
  label: string;
  headingCity: string;
  districts: readonly DistrictCardData[];
};

const CITY_TABS: readonly CityTabData[] = [
  {
    id: "hcm",
    label: "Hồ Chí Minh",
    headingCity: "Hồ Chí Minh",
    districts: [
      {
        id: "quan-1",
        name: "Quận 1",
        imageUrl:
          "https://owa.bestprice.vn/images/destinations/uploads/quan-1-6094b9a6a8de1.jpg",
        listingCountLabel: "99+",
      },
      {
        id: "quan-2",
        name: "Quận 2",
        imageUrl:
          "https://cdn.xanhsm.com/2025/03/0837c51f-ban-do-quan-2-23.jpg",
        listingCountLabel: "99+",
      },
      {
        id: "quan-3",
        name: "Quận 3",
        imageUrl:
          "https://owa.bestprice.vn/images/media/c2f9d615-43f7-4a0a-a58c-5510783b762f-61dfd65dc41c0.png",
        listingCountLabel: "99+",
      },
      {
        id: "quan-4",
        name: "Quận 4",
        imageUrl:
          "https://static.vinwonders.com/production/quan-4-co-gi-choi-top-banner.jpg",
        listingCountLabel: "99+",
      },
      {
        id: "quan-5",
        name: "Quận 5",
        imageUrl:
          "https://cafebiz.cafebizcdn.vn/162123310254002176/2022/9/14/1-quan-5-16630348695751909914574-1663057823314-16630578233981465483890-1663119461036-1663119462054538517302.jpg",
        listingCountLabel: "99+",
      },
      {
        id: "quan-6",
        name: "Quận 6",
        imageUrl:
          "https://maisonoffice.vn/wp-content/uploads/2024/04/1-tong-quan-thong-tin-ve-quan-6-thanh-pho-ho-chi-minh.jpg",
        listingCountLabel: "99+",
      },
      {
        id: "quan-7",
        name: "Quận 7",
        imageUrl:
          "https://iwater.vn/Image/Picture/New/333/quan_7.jpg",
        listingCountLabel: "99+",
      },
      {
        id: "quan-8",
        name: "Quận 8",
        imageUrl:
          "https://nasaland.vn/wp-content/uploads/2022/09/quan-8-1.jpeg",
        listingCountLabel: "99+",
      },
      {
        id: "quan-9",
        name: "Quận 9",
        imageUrl:
          "https://cdn.vntrip.vn/cam-nang/wp-content/uploads/2018/03/1-10.png",
        listingCountLabel: "99+",
      },
      {
        id: "quan-10",
        name: "Quận 10",
        imageUrl:
          "https://file4.batdongsan.com.vn/2021/03/30/akCJKkFO/20210330173404-99a0.jpg",
        listingCountLabel: "99+",
      },
      {
        id: "quan-11",
        name: "Quận 11",
        imageUrl:
          "https://iwater.vn/Image/Picture/New/333/quan_11.jpg",
        listingCountLabel: "99+",
      },
      {
        id: "quan-12",
        name: "Quận 12",
        imageUrl:
          "https://maisonoffice.vn/wp-content/uploads/2024/04/1-tong-hop-thong-tin-moi-nhat-ve-quan-12-tphcm.jpg",
        listingCountLabel: "99+",
      },
      {
        id: "binh-tan",
        name: "Bình Tân",
        imageUrl:
          "https://e-magazine.asiamedia.vn/wp-content/uploads/2023/12/3c55f2b1-c60f-452c-b5cf-fb4d35181235.jpg",
        listingCountLabel: "99+",
      },
      {
        id: "binh-thanh",
        name: "Bình Thạnh",
        imageUrl:
          "https://static.chotot.com/storage/chotot-kinhnghiem/nha/2024/08/f7bfb375-binh-thanh-gan-quan-nao.jpg",
        listingCountLabel: "99+",
      },
      {
        id: "go-vap",
        name: "Gò Vấp",
        imageUrl:
          "https://maisonoffice.vn/wp-content/uploads/2024/05/1-gioi-thieu-khai-quat-ve-quan-go-vap.jpg",
        listingCountLabel: "99+",
      },
      {
        id: "phu-nhuan",
        name: "Phú Nhuận",
        imageUrl:
          "https://vivuvietnam.org/wp-content/uploads/2024/10/phu-nhuan-co-gi-choi-jpg.webp",
        listingCountLabel: "99+",
      },
      {
        id: "tan-binh",
        name: "Tân Bình",
        imageUrl:
          "https://maisonoffice.vn/wp-content/uploads/2024/04/2-quan-tan-binh-co-lich-su-hinh-thanh-va-phat-trien-hon-300-nam.jpg",
        listingCountLabel: "99+",
      },
      {
        id: "tan-phu",
        name: "Tân Phú",
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaXgTfNqNxPqXdesVBW-mp5Zhwl0ZJlDRJzVQiU6pq9KK1WMVYrlldlIY&s=10",
        listingCountLabel: "99+",
      },
      {
        id: "thu-duc",
        name: "Thủ Đức",
        imageUrl:
          "https://static.chotot.com/storage/chotot-kinhnghiem/nha/2024/10/575c1c4f-dai-hoc-quoc-gia-thu-duc.jpg",
        listingCountLabel: "99+",
      },
    ],
  },
  {
    id: "hn",
    label: "Hà Nội",
    headingCity: "Hà Nội",
    districts: [
      {
        id: "ba-dinh",
        name: "Ba Đình",
        imageUrl:
          "https://cdn.xanhsm.com/2024/11/12134be8-quang-truong-ba-dinh-1.jpg",
        listingCountLabel: "99+",
      },
      {
        id: "cau-giay",
        name: "Cầu Giấy",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/0/04/Discovery_C%E1%BA%A7u_Gi%E1%BA%A5y.jpg",
        listingCountLabel: "99+",
      },
      {
        id: "dong-da",
        name: "Đống Đa",
        imageUrl:
          "https://maisonoffice.vn/wp-content/uploads/2024/01/1-khai-quat-ve-quan-dong-da-ha-noi-viet-nam.jpg",
        listingCountLabel: "99+",
      },
      {
        id: "hai-ba-trung",
        name: "Hai Bà Trưng",
        imageUrl:
          "https://nasaland.vn/wp-content/uploads/2022/11/quan-hai-ba-trung-1.jpeg",
        listingCountLabel: "99+",
      },
      {
        id: "hoan-kiem",
        name: "Hoàn Kiếm",
        imageUrl:
          "https://statics.vinpearl.com/ho-guom-o-dau-1_1693440287.jpeg",
        listingCountLabel: "99+",
      },
      {
        id: "hoang-mai",
        name: "Hoàng Mai",
        imageUrl:
          "https://ttdn.vn/Uploads/Images/2023/10/2/5/6817-.jpg",
        listingCountLabel: "99+",
      },
      {
        id: "long-bien",
        name: "Long Biên",
        imageUrl:
          "https://imghappyvietnam.vnanet.vn/MediaUpload/Org/2025/10/08/114002-vna_potal_cau_long_bien_-_bieu_tuong_van_hoa_lich_su_cua_ha_noi_7831269-1.jpeg",
        listingCountLabel: "99+",
      },
      {
        id: "nam-tu-liem",
        name: "Nam Từ Liêm",
        imageUrl:
          "https://hnm.1cdn.vn/2025/04/19/tu-liem.jpg",
        listingCountLabel: "99+",
      },
      {
        id: "bac-tu-liem",
        name: "Bắc Từ Liêm",
        imageUrl:
          "https://icdn.dantri.com.vn/dansinh/2024/05/11/cong-vien-hoa-binh-1715428396255.jpg",
        listingCountLabel: "99+",
      },
      {
        id: "thanh-xuan",
        name: "Thanh Xuân",
        imageUrl:
          "https://maisonoffice.vn/wp-content/uploads/2024/01/1-tim-hieu-thong-tin-ve-quan-thanh-xuan-ha-noi-viet-nam.jpg",
        listingCountLabel: "99+",
      },
      {
        id: "ha-dong",
        name: "Hà Đông",
        imageUrl:
          "https://cafefcdn.com/203337114487263232/2023/7/27/ha-dong-27072023-1690501013642-1690501013805559207044.jpeg",
        listingCountLabel: "99+",
      },
      {
        id: "tay-ho",
        name: "Tây Hồ",
        imageUrl:
          "https://files.dandautu.vn/images/info-areas/image-806-1681974194-urZ9DFPsvI.jpg",
        listingCountLabel: "99+",
      },
    ],
  },
];

export function RentalByDistrictTabs() {
  const [activeCityId, setActiveCityId] = useState<CityId>(CITY_TABS[0].id);

  const activeTab = useMemo(
    () => CITY_TABS.find((cityTab) => cityTab.id === activeCityId) ?? CITY_TABS[0],
    [activeCityId],
  );

  return (
    <section className="bg-[#f3f5f7] py-14">
      <div className="mx-auto w-full max-w-400 px-4 lg:px-8">
        <div className="inline-flex items-center gap-3" role="tablist" aria-label="Chon thanh pho">
          {CITY_TABS.map((cityTab) => {
            const isActive = activeCityId === cityTab.id;

            return (
              <button
                key={cityTab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`district-tab-panel-${cityTab.id}`}
                className={`rounded-2xl border px-6 py-3 text-[16px] font-semibold transition-colors ${isActive
                  ? "border-[#27c4cb] bg-[#27c4cb] text-white"
                  : "border-slate-300 bg-white text-slate-500 hover:border-[#27c4cb]/60 hover:text-[#0a6d97]"
                  }`}
                onClick={() => setActiveCityId(cityTab.id)}
              >
                {cityTab.label}
              </button>
            );
          })}
        </div>

        <h2 className="mt-5 text-[30px] font-extrabold leading-tight text-[#045a84] md:text-[48px]">
          Phòng trọ cho thuê tại <span className="text-[#27c4cb]">{activeTab.headingCity}</span>
        </h2>

        <div
          id={`district-tab-panel-${activeTab.id}`}
          role="tabpanel"
          className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6"
        >
          {activeTab.districts.map((district) => {
            const cityQueryValue = activeCityId === "hcm" ? "TP. Hồ Chí Minh" : "Hà Nội";
            const searchUrl = `/category?city=${slugify(cityQueryValue)}&district=${slugify(district.name)}`;

            return (
              <Link
                key={district.id}
                href={searchUrl}
                className="group relative block overflow-hidden rounded-3xl cursor-pointer"
              >
                <div className="relative aspect-square bg-slate-300">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-105"
                    style={{ backgroundImage: `url(${district.imageUrl})` }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/15 to-transparent" />

                  <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[15px] font-bold text-[#0a6d97]">
                    {district.listingCountLabel}
                  </span>

                  <p className="absolute bottom-3 left-3 max-w-[85%] text-[18px] font-extrabold leading-tight text-white md:text-[32px]">
                    {district.name}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}