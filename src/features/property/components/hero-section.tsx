import { SearchPanel } from "./search-panel";

type HeroSectionProps = {
  heroImageUrl: string;
  searchPlaceholder: string;
  priceOptions: readonly string[];
  areaOptions: readonly string[];
  roomTypeOptions: readonly string[];
};

export function HeroSection({
  heroImageUrl,
  searchPlaceholder,
  priceOptions,
  areaOptions,
  roomTypeOptions,
}: HeroSectionProps) {
  return (
    <section className="relative isolate overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroImageUrl})`,
        }}
      />
      <div className="absolute inset-0 bg-black/45" />

      <div className="relative mx-auto flex min-h-155 w-full max-w-310 flex-col items-center px-4 pb-16 pt-20 lg:px-8 lg:pt-24">
        <h1 className="max-w-4xl text-center text-[56px] font-extrabold leading-tight text-white md:text-[72px]">
          Tìm phòng thông minh,
          <br />
          chốn về <span className="text-[#2ecad0]">“cực xinh”</span>.
        </h1>

        <div className="mt-8 w-full max-w-245">
          <SearchPanel
            searchPlaceholder={searchPlaceholder}
            priceOptions={priceOptions}
            areaOptions={areaOptions}
            roomTypeOptions={roomTypeOptions}
          />
        </div>
      </div>
    </section>
  );
}