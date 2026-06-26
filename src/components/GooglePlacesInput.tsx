"use client";

import Script from "next/script";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type PlaceValue = {
  address: string;
  city?: string;
  district?: string;
  lat?: number;
  lng?: number;
  placeId?: string;
};

type GooglePlacesInputProps = {
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

declare global {
  interface Window {
    google?: any;
  }
}

const SCRIPT_ID = "google-maps-places-script";

function getAddressComponent(
  components: Array<{ long_name?: string; types?: string[] }> | undefined,
  type: string
): string | undefined {
  if (!components) {
    return undefined;
  }

  const component = components.find((item) => item.types?.includes(type));
  return component?.long_name;
}

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
}: GooglePlacesInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isScriptReady, setIsScriptReady] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  const resolvedValue = value ?? internalValue;

  const scriptSrc = useMemo(() => {
    if (!apiKey) {
      return null;
    }

    return `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;
  }, [apiKey]);

  useEffect(() => {
    if (value !== undefined) {
      return;
    }

    setInternalValue(defaultValue ?? "");
  }, [defaultValue, value]);

  useEffect(() => {
    if (!isScriptReady) {
      return;
    }

    if (!inputRef.current || !window.google?.maps?.places) {
      return;
    }

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ["address_components", "geometry", "formatted_address", "place_id"],
      types: ["geocode"],
    });

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (!place) {
        return;
      }

      const address = place.formatted_address ?? resolvedValue ?? "";
      const city =
        getAddressComponent(place.address_components, "administrative_area_level_1") ??
        getAddressComponent(place.address_components, "locality");
      const district =
        getAddressComponent(place.address_components, "administrative_area_level_2") ??
        getAddressComponent(place.address_components, "sublocality_level_1") ??
        getAddressComponent(place.address_components, "sublocality");
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();

      if (value === undefined) {
        setInternalValue(address);
      }

      onPlaceSelected?.({
        address,
        city,
        district,
        lat,
        lng,
        placeId: place.place_id,
      });
    });

    return () => {
      if (listener) {
        window.google?.maps?.event.removeListener(listener);
      }
    };
  }, [isScriptReady, onPlaceSelected, resolvedValue, value]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value;

    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
    onPlaceSelected?.(null);
  }

  return (
    <div className={containerClassName}>
      {scriptSrc ? (
        <Script id={SCRIPT_ID} src={scriptSrc} strategy="afterInteractive" onLoad={() => setIsScriptReady(true)} />
      ) : null}
      {label ? (
        <label className="mb-1.5 block text-[15px] font-semibold text-slate-700">
          {label}
        </label>
      ) : null}
      <input
        ref={inputRef}
        name={name}
        type="text"
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={resolvedValue}
        onChange={handleChange}
        className={
          inputClassName ??
          "h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-[17px] text-slate-700 outline-none transition focus:border-[#0b7ea9] focus:ring-4 focus:ring-[#25c3c8]/20"
        }
      />
      {!apiKey ? (
        <p className="mt-2 text-xs text-amber-600">
          Thiếu NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, autocomplete sẽ tạm thời không hoạt động.
        </p>
      ) : null}
    </div>
  );
}
