function slugify(value: string): string {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export function buildRoomRouteFromSlug(slug: string): string {
	return `/phong-tro/${slugify(slug)}`;
}
