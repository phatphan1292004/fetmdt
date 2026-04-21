import "server-only";

import { headers } from "next/headers";

import type { PostListingData } from "./get-home-data";
import { getFeaturedPostsData } from "./get-home-data";

type NewestPostsResponse = {
  success: boolean;
  data?: PostListingData[];
};

const DEFAULT_NEWEST_POST_LIMIT = 6;
const MAX_NEWEST_POST_LIMIT = 20;

function normalizeLimit(limit: number): number {
  if (!Number.isFinite(limit) || limit <= 0) {
    return DEFAULT_NEWEST_POST_LIMIT;
  }

  return Math.min(Math.floor(limit), MAX_NEWEST_POST_LIMIT);
}

async function resolveApiBaseUrl(): Promise<{ baseUrl: string; cookieHeader: string } | null> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");

  if (!host) {
    return null;
  }

  const protocol =
    headerStore.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "development" ? "http" : "https");

  return {
    baseUrl: `${protocol}://${host}`,
    cookieHeader: headerStore.get("cookie") ?? "",
  };
}

export async function getNewestPostsData(limit = 6): Promise<readonly PostListingData[]> {
  try {
    const apiContext = await resolveApiBaseUrl();

    if (!apiContext) {
      return getFeaturedPostsData();
    }

    const safeLimit = normalizeLimit(limit);
    const response = await fetch(
      `${apiContext.baseUrl}/api/v1/posts?section=newest&limit=${safeLimit}`,
      {
        method: "GET",
        headers: {
          cookie: apiContext.cookieHeader,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return getFeaturedPostsData();
    }

    const payload = (await response.json()) as NewestPostsResponse;

    if (!payload.success || !Array.isArray(payload.data) || payload.data.length === 0) {
      return getFeaturedPostsData();
    }

    return payload.data;
  } catch (error) {
    console.error("[getNewestPostsData] Failed to load newest posts", error);
    return getFeaturedPostsData();
  }
}