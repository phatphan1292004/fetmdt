"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

type PlaceValue = {
  address: string;
  city?: string;
  district?: string;
  lat?: number;
  lng?: number;
  placeId?: string;
};

type LocationInputProps = {
  label?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  containerClassName?: string;
  inputClassName?: string;
  onValueChange?: (value: string) => void;
  onPlaceSelected?: (place: PlaceValue | null) => void;
};

// OpenStreetMap Nominatim API Response Type
type NominatimResult = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    suburb?: string;
    city_district?: string;
    state?: string;
  };
};

export function GooglePlacesInput({
  label,
  name,
  placeholder,
  value,
  defaultValue,
  required,
  disabled,
  containerClassName,
  inputClassName,
  onValueChange,
  onPlaceSelected,
}: LocationInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const resolvedValue = value ?? internalValue;

  useEffect(() => {
    if (value !== undefined) {
      return;
    }
    setInternalValue(defaultValue ?? "");
  }, [defaultValue, value]);

  // Debounce API calls
  useEffect(() => {
    const query = resolvedValue.trim();
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        // Using OpenStreetMap Nominatim - Free, No API Key needed
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&addressdetails=1&countrycodes=vn&limit=5`,
          {
            headers: {
              "Accept-Language": "vi", // Request Vietnamese results
            },
          }
        );
        const data = (await res.json()) as NominatimResult[];
        setSuggestions(data);
      } catch (error) {
        console.error("Nominatim search error:", error);
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [resolvedValue]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value;

    if (value === undefined) {
      setInternalValue(nextValue);
    }

    setShowDropdown(true);
    onValueChange?.(nextValue);
    onPlaceSelected?.(null);
  }

  function handleSelectSuggestion(suggestion: NominatimResult) {
    const address = suggestion.display_name;
    const city =
      suggestion.address.city ||
      suggestion.address.town ||
      suggestion.address.state ||
      "";
    const district =
      suggestion.address.county ||
      suggestion.address.city_district ||
      suggestion.address.suburb ||
      "";
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);

    if (value === undefined) {
      setInternalValue(address);
    } else {
      onValueChange?.(address);
    }

    setShowDropdown(false);

    onPlaceSelected?.({
      address,
      city,
      district,
      lat,
      lng,
      placeId: String(suggestion.place_id),
    });
  }

  return (
    <div className={`relative ${containerClassName ?? ""}`} ref={containerRef}>
      {label ? (
        <label className="mb-1.5 block text-[15px] font-semibold text-slate-700">
          {label}
        </label>
      ) : null}
      <input
        name={name}
        type="text"
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={resolvedValue}
        onChange={handleChange}
        onFocus={() => setShowDropdown(true)}
        className={
          inputClassName ??
          "h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-[17px] text-slate-700 outline-none transition focus:border-[#0b7ea9] focus:ring-4 focus:ring-[#25c3c8]/20"
        }
      />
      {loading && showDropdown ? (
        <div className="absolute left-0 top-[105%] z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-500 shadow-lg">
          Đang tìm địa chỉ...
        </div>
      ) : null}
      {!loading && showDropdown && suggestions.length > 0 ? (
        <ul className="absolute left-0 top-[105%] z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
          {suggestions.map((item) => (
            <li
              key={item.place_id}
              onClick={() => handleSelectSuggestion(item)}
              className="cursor-pointer px-4 py-2 text-[15px] text-slate-700 hover:bg-slate-50"
            >
              {item.display_name}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-2 text-xs text-slate-500">
        Powered by OpenStreetMap (Miễn phí, không cần thẻ Visa)
      </p>
    </div>
  );
}
