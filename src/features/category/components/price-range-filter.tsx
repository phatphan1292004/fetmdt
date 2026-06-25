"use client";

import { useMemo, useState } from "react";

type PriceRangeFilterProps = {
  min?: number;
  max?: number;
  step?: number;
};

function formatVndShort(value: number): string {
  if (value === 0) return "0\u0111";
  const million = value / 1_000_000;
  return `${million} tri\u1ec7u`;
}

function formatVnd(value: number): string {
  return `${value.toLocaleString("vi-VN")}\u0111`;
}

export function PriceRangeFilter({ min = 0, max = 20_000_000, step = 500_000 }: PriceRangeFilterProps) {
  const [minValue, setMinValue] = useState(min);
  const [maxValue, setMaxValue] = useState(max);

  const minPercent = useMemo(() => ((minValue - min) / (max - min)) * 100, [max, min, minValue]);
  const maxPercent = useMemo(() => ((maxValue - min) / (max - min)) * 100, [max, min, maxValue]);

  return (
    <div className="mt-3 rounded-2xl border border-slate-200/90 bg-slate-50/60 p-3.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{"Kho\u1ea3ng gi\u00e1"}</p>
        <span className="rounded-lg bg-[#19b38f]/12 px-2.5 py-1 text-[12px] font-semibold text-[#0f8f72]">
          {formatVndShort(minValue)} - {formatVndShort(maxValue)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-[12px] font-semibold text-slate-500">
        <span>{"Th\u1ea5p"}: {formatVndShort(min)}</span>
        <span>Cao: {formatVndShort(max)}</span>
      </div>

      <div className="relative mt-3 h-7">
        <div className="absolute top-1/2 h-[6px] w-full -translate-y-1/2 rounded-full bg-[#16a085]/20" />
        <div
          className="absolute top-1/2 h-[6px] -translate-y-1/2 rounded-full bg-[#16a085]"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={(event) => {
            const next = Number(event.target.value);
            setMinValue(Math.min(next, maxValue - step));
          }}
          className="pointer-events-none absolute h-7 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#0f9f7c] [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0f9f7c]"
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={(event) => {
            const next = Number(event.target.value);
            setMaxValue(Math.max(next, minValue + step));
          }}
          className="pointer-events-none absolute h-7 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#0f9f7c] [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0f9f7c]"
        />
      </div>

      <div className="mt-1 flex items-center justify-between text-[12px] font-semibold text-slate-600">
        <span>{formatVnd(minValue)}</span>
        <span>{formatVnd(maxValue)}+</span>
      </div>
    </div>
  );
}
