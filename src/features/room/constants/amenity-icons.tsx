import type { ReactElement } from "react";
import type { AmenitySlug } from "../types";

const iconClassName = "h-4 w-4 text-[#25c3c8]";

export const AMENITY_MAP: Readonly<Record<AmenitySlug, ReactElement>> = {
	wifi: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClassName}>
			<path d="M5 12.55a11 11 0 0 1 14.08 0" />
			<path d="M1.42 9a16 16 0 0 1 21.16 0" />
			<path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
			<path d="M12 20h.01" />
		</svg>
	),
	"air-conditioner": (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClassName}>
			<path d="M3 13h18" />
			<path d="M3 7h18" />
			<path d="M5 21l2-4" />
			<path d="M15 17l2 4" />
			<path d="M9 17v1" />
			<path d="M12 17v1" />
			<path d="M15 17v1" />
		</svg>
	),
	parking: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClassName}>
			<path d="M19 13H5" />
			<path d="M19 7H5" />
			<path d="M5 21V3h14v18" />
		</svg>
	),
	"washing-machine": (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClassName}>
			<path d="M7 20V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v13" />
			<path d="M5 20h14" />
		</svg>
	),
	security: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClassName}>
			<path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3Z" />
			<path d="m9.5 12 1.7 1.7 3.3-3.3" />
		</svg>
	),
	fridge: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClassName}>
			<rect x="7" y="3" width="10" height="18" rx="2" />
			<path d="M7 12h10" />
			<path d="M10 8h.01" />
			<path d="M10 16h.01" />
		</svg>
	),
	wc: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClassName}>
			<path d="M8 4h8" />
			<path d="M9 4v6a3 3 0 0 0 6 0V4" />
			<path d="M5 20h14" />
			<path d="M12 13v7" />
		</svg>
	),
	elevator: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClassName}>
			<path d="M12 3v18" />
			<path d="M5 8h14" />
			<path d="M5 16h14" />
		</svg>
	),
	furnished: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClassName}>
			<path d="M4 19h16" />
			<path d="M6 19V9l6-4 6 4v10" />
			<path d="M10 19v-5h4v5" />
		</svg>
	),
	"fingerprint-lock": (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClassName}>
			<path d="M12 3v6" />
			<path d="M8 6h8" />
			<path d="M7 13h10" />
			<path d="M6 20h12" />
		</svg>
	),
	"water-heater": (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClassName}>
			<path d="M4 12a8 8 0 1 0 16 0" />
			<path d="M12 7v10" />
		</svg>
	),
	kitchen: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClassName}>
			<path d="M4 12h16" />
			<path d="M12 4v16" />
		</svg>
	),
};